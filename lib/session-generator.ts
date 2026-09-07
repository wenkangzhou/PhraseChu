import { learningInsights, listeningDueExpressions, newExpressionIdsToday } from "@/lib/activity";
import { isDue } from "@/lib/srs";
import { createSessionSeed, shuffledWithSeed } from "@/lib/random";
import type { AppSettings, Expression, ExpressionProgress, PracticeAttempt, QuestionType, StudySession } from "@/types/domain";

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

function selectExpressions(
  expressions: Expression[],
  kind: SessionKind,
  progressMap: Record<string, ExpressionProgress>,
  favorites: string[],
  settings: AppSettings,
  attempts: PracticeAttempt[],
  seed: string,
  scenarioId?: string,
) {
  const learned = expressions.filter((item) => progressMap[item.id]?.reviewCount > 0);
  const due = learned
    .filter((item) => isDue(progressMap[item.id]))
    .sort((a, b) => (progressMap[a.id].nextReviewAt ?? "").localeCompare(progressMap[b.id].nextReviewAt ?? ""));
  const dueIds = new Set(due.map((item) => item.id));
  const weak = randomizedWeak(learned.filter((item) => !dueIds.has(item.id)), progressMap, seed);
  const freshItems = expressions.filter((item) => !progressMap[item.id]?.reviewCount);
  const fresh = [
    ...shuffledWithSeed(freshItems.filter((item) => item.savedToPersonal), `${seed}:fresh:personal`),
    ...shuffledWithSeed(freshItems.filter((item) => !item.savedToPersonal), `${seed}:fresh:catalog`),
  ];
  const remainingNew = Math.max(0, settings.newPerDay - newExpressionIdsToday(attempts).size);
  let selected: Expression[] = [];

  if (kind === "daily") selected = [...due.slice(0, 15), ...weak.slice(0, Math.max(0, 10 - due.length)), ...fresh.slice(0, remainingNew)];
  if (kind === "quick") selected = [...due, ...weak].slice(0, 7);
  if (kind === "due") selected = due.slice(0, 20);
  if (kind === "hard") selected = shuffledWithSeed(learned.filter((item) => progressMap[item.id].lastResult === "hard" || progressMap[item.id].lastResult === "again"), `${seed}:hard`).slice(0, 20);
  if (kind === "weak") selected = learningInsights(expressions, progressMap, attempts).map((item) => item.expression);
  if (kind === "favorite") selected = shuffledWithSeed(expressions.filter((item) => favorites.includes(item.id)), `${seed}:favorite`).slice(0, 20);
  if (kind === "scenario") selected = shuffledWithSeed(expressions.filter((item) => scenarioId === "personal" ? item.savedToPersonal : item.scenarioId === scenarioId), `${seed}:scenario`);
  if (kind === "listening") selected = shuffledWithSeed(listeningDueExpressions(expressions, progressMap, attempts), `${seed}:listening`).slice(0, 12);

  return selected.filter((item, index, all) => all.findIndex((entry) => entry.id === item.id) === index);
}

function listeningItems(
  selected: Expression[],
  expressions: Expression[],
  kind: SessionKind,
  progressMap: Record<string, ExpressionProgress>,
  attempts: PracticeAttempt[],
  seed: string,
) {
  if (kind === "listening" || !selected.length) return [];
  const learnedDue = listeningDueExpressions(expressions, progressMap, attempts);
  const learnedDueIds = new Set(learnedDue.map((item) => item.id));
  const selectedIds = new Set(selected.map((item) => item.id));
  const selectedDue = selected.filter((item) => !progressMap[item.id]?.reviewCount || learnedDueIds.has(item.id));
  const dailyQueue = kind === "daily" ? learnedDue.filter((item) => !selectedIds.has(item.id)) : [];
  const candidates = shuffledWithSeed([...selectedDue, ...dailyQueue], `${seed}:listening-items`);
  const target = Math.min(5, Math.max(1, Math.round(selected.length * .25)));
  return candidates.slice(0, target);
}

export interface DailyPlan {
  newCount: number;
  reviewCount: number;
  listeningCount: number;
  questionCount: number;
  estimatedMinutes: number;
}

export function getDailyPlan(
  expressions: Expression[],
  progressMap: Record<string, ExpressionProgress>,
  favorites: string[],
  settings: AppSettings,
  attempts: PracticeAttempt[],
): DailyPlan {
  const seed = `plan:${new Date().toDateString()}:${attempts.length}`;
  const selected = selectExpressions(expressions, "daily", progressMap, favorites, settings, attempts, seed);
  const listeningCount = settings.mode === "listen" ? listeningItems(selected, expressions, "daily", progressMap, attempts, seed).length : 0;
  const newCount = selected.filter((item) => !progressMap[item.id]?.reviewCount).length;
  const reviewCount = selected.length - newCount;
  const questionCount = selected.length + listeningCount;
  return { newCount, reviewCount, listeningCount, questionCount, estimatedMinutes: questionCount ? Math.max(1, Math.ceil(questionCount * .45)) : 0 };
}

export function generateSession(
  expressions: Expression[],
  kind: SessionKind,
  progressMap: Record<string, ExpressionProgress>,
  favorites: string[],
  settings: AppSettings,
  attempts: PracticeAttempt[],
  scenarioId?: string,
): StudySession | null {
  const seed = createSessionSeed();
  const selection = selectExpressions(expressions, kind, progressMap, favorites, settings, attempts, seed, scenarioId);
  if (!selection.length) return null;

  const selected = shuffledWithSeed(selection, `${seed}:order`);
  const practiceTypes = questionTypes(selected.length, seed);
  const baseQuestions = selected.map((expression, index) => ({
    expression,
    type: kind === "listening" ? "listening" as const : practiceTypes[index],
  }));
  const listeningQuestions = (settings.mode === "listen" ? listeningItems(selected, expressions, kind, progressMap, attempts, seed) : [])
    .map((expression) => ({ expression, type: "listening" as const }));
  const questions = shuffledWithSeed([...baseQuestions, ...listeningQuestions], `${seed}:question-order`);
  const questionIds = questions.map(({ expression, type }, index) => `q2|${type}|${encodeURIComponent(expression.id)}|${seed}-${index}`);
  const expressionIds = [...new Set([...selected, ...listeningQuestions.map((item) => item.expression)].map((item) => item.id))];

  return {
    id: `${kind}-${seed}`,
    kind,
    questionIds,
    expressionIds,
    currentIndex: 0,
    startedAt: new Date().toISOString(),
    completed: false,
    newCount: selected.filter((item) => !progressMap[item.id]?.reviewCount).length,
    reviewCount: selected.filter((item) => progressMap[item.id]?.reviewCount).length,
    initialActiveCount: Object.values(progressMap).filter((item) => item.status === "active" || item.status === "mastered").length,
    answeredCount: 0,
    correctCount: 0,
    skippedCount: 0,
  };
}
