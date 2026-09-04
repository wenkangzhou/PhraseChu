import { isDue } from "@/lib/srs";
import { createSessionSeed, shuffledWithSeed } from "@/lib/random";
import type { AppSettings, Expression, ExpressionProgress, QuestionType, StudySession } from "@/types/domain";

type SessionKind = StudySession["kind"];

const types: QuestionType[] = ["recall", "cloze", "recall", "reorder", "scenario", "variation"];

function questionTypes(count: number, seed: string): QuestionType[] {
  const result: QuestionType[] = [];
  for (let batch = 0; result.length < count; batch += 1) {
    result.push(...shuffledWithSeed(types, `${seed}:types:${batch}`));
  }
  return result.slice(0, count);
}

function randomizedWeak(
  expressions: Expression[],
  progressMap: Record<string, ExpressionProgress>,
  seed: string,
) {
  const groups = new Map<number, Expression[]>();
  for (const expression of expressions) {
    const mastery = progressMap[expression.id].mastery;
    groups.set(mastery, [...(groups.get(mastery) ?? []), expression]);
  }
  return [...groups.entries()]
    .sort(([masteryA], [masteryB]) => masteryA - masteryB)
    .flatMap(([mastery, items]) => shuffledWithSeed(items, `${seed}:weak:${mastery}`));
}

export function generateSession(
  expressions: Expression[],
  kind: SessionKind,
  progressMap: Record<string, ExpressionProgress>,
  favorites: string[],
  settings: AppSettings,
  scenarioId?: string,
): StudySession | null {
  const seed = createSessionSeed();
  const learned = expressions.filter((item) => progressMap[item.id]?.reviewCount > 0);
  const due = learned
    .filter((item) => isDue(progressMap[item.id]))
    .sort((a, b) => (progressMap[a.id].nextReviewAt ?? "").localeCompare(progressMap[b.id].nextReviewAt ?? ""));
  const dueIds = new Set(due.map((item) => item.id));
  const weak = randomizedWeak(
    learned.filter((item) => !dueIds.has(item.id)),
    progressMap,
    seed,
  );
  const freshItems = expressions.filter((item) => !progressMap[item.id]?.reviewCount);
  const fresh = [
    ...shuffledWithSeed(freshItems.filter((item) => item.savedToPersonal), `${seed}:fresh:personal`),
    ...shuffledWithSeed(freshItems.filter((item) => !item.savedToPersonal), `${seed}:fresh:catalog`),
  ];
  let selected: Expression[] = [];

  if (kind === "daily") selected = [...due.slice(0, 15), ...weak.slice(0, Math.max(0, 10 - due.length)), ...fresh.slice(0, settings.newPerDay)];
  if (kind === "quick") selected = [...due, ...weak].slice(0, 7);
  if (kind === "due") selected = due.slice(0, 20);
  if (kind === "hard") selected = shuffledWithSeed(learned.filter((item) => progressMap[item.id].lastResult === "hard" || progressMap[item.id].lastResult === "again"), `${seed}:hard`).slice(0, 20);
  if (kind === "favorite") selected = shuffledWithSeed(expressions.filter((item) => favorites.includes(item.id)), `${seed}:favorite`).slice(0, 20);
  if (kind === "scenario") selected = shuffledWithSeed(expressions.filter((item) => scenarioId === "personal" ? item.savedToPersonal : item.scenarioId === scenarioId), `${seed}:scenario`);
  if (kind === "listening") selected = shuffledWithSeed(learned, `${seed}:listening`).slice(0, 12);

  selected = selected.filter((item, index, all) => all.findIndex((entry) => entry.id === item.id) === index);
  if (!selected.length) return null;

  selected = shuffledWithSeed(selected, `${seed}:order`);
  const practiceTypes = questionTypes(selected.length, seed);
  const baseQuestions = selected.map((expression, index) => ({
    expression,
    type: kind === "listening" ? "listening" as const : practiceTypes[index],
  }));
  const listeningCount = kind !== "listening" && settings.mode === "listen"
    ? Math.min(5, Math.max(1, Math.round(selected.length * 0.25)))
    : 0;
  const listeningQuestions = shuffledWithSeed(selected, `${seed}:listening-items`)
    .slice(0, listeningCount)
    .map((expression) => ({ expression, type: "listening" as const }));
  const questions = shuffledWithSeed([...baseQuestions, ...listeningQuestions], `${seed}:question-order`);
  const questionIds = questions.map(({ expression, type }, index) => `q2|${type}|${encodeURIComponent(expression.id)}|${seed}-${index}`);

  return {
    id: `${kind}-${seed}`,
    kind,
    questionIds,
    expressionIds: selected.map((item) => item.id),
    currentIndex: 0,
    startedAt: new Date().toISOString(),
    completed: false,
    newCount: selected.filter((item) => !progressMap[item.id]?.reviewCount).length,
    reviewCount: selected.filter((item) => progressMap[item.id]?.reviewCount).length,
    initialActiveCount: Object.values(progressMap).filter((item) => item.status === "active" || item.status === "mastered").length,
  };
}
