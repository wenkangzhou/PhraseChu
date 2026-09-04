import { expressions } from "@/lib/data/expressions";
import { isDue } from "@/lib/srs";
import type { AppSettings, ExpressionProgress, QuestionType, StudySession } from "@/types/domain";

type SessionKind = StudySession["kind"];

const types: QuestionType[] = ["recall", "cloze", "recall", "reorder", "scenario", "variation"];

export function generateSession(
  kind: SessionKind,
  progressMap: Record<string, ExpressionProgress>,
  favorites: string[],
  settings: AppSettings,
  scenarioId?: string,
): StudySession | null {
  const learned = expressions.filter((item) => progressMap[item.id]?.reviewCount > 0);
  const due = learned
    .filter((item) => isDue(progressMap[item.id]))
    .sort((a, b) => (progressMap[a.id].nextReviewAt ?? "").localeCompare(progressMap[b.id].nextReviewAt ?? ""));
  const weak = learned
    .filter((item) => !due.some((dueItem) => dueItem.id === item.id))
    .sort((a, b) => progressMap[a.id].mastery - progressMap[b.id].mastery);
  const fresh = expressions.filter((item) => !progressMap[item.id]?.reviewCount);
  let selected = [] as typeof expressions;

  if (kind === "daily") selected = [...due.slice(0, 15), ...weak.slice(0, Math.max(0, 10 - due.length)), ...fresh.slice(0, settings.newPerDay)];
  if (kind === "quick") selected = [...due, ...weak].slice(0, 7);
  if (kind === "due") selected = due.slice(0, 20);
  if (kind === "hard") selected = learned.filter((item) => progressMap[item.id].lastResult === "hard" || progressMap[item.id].lastResult === "again").slice(0, 20);
  if (kind === "favorite") selected = expressions.filter((item) => favorites.includes(item.id)).slice(0, 20);
  if (kind === "scenario") selected = expressions.filter((item) => item.scenarioId === scenarioId);
  if (kind === "listening") selected = learned.slice(0, 12);

  selected = selected.filter((item, index, all) => all.findIndex((entry) => entry.id === item.id) === index);
  if (!selected.length) return null;

  const questionIds = selected.map((item, index) => {
    const type = kind === "listening" ? "listening" : types[index % types.length];
    return `${type}:${item.id}`;
  });

  return {
    id: `${kind}-${Date.now()}`,
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
