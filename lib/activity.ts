import type { Expression, ExpressionProgress, PracticeAttempt, ReviewRating, SessionSummary } from "@/types/domain";

const activeStatuses = new Set(["active", "mastered"]);

function localDayKey(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function startOfWeek(now: Date) {
  const start = new Date(now);
  const day = start.getDay() || 7;
  start.setDate(start.getDate() - day + 1);
  start.setHours(0, 0, 0, 0);
  return start;
}

export function newExpressionIdsToday(attempts: PracticeAttempt[], now = new Date()) {
  const today = localDayKey(now);
  return new Set(attempts.filter((attempt) => attempt.wasNew && localDayKey(attempt.attemptedAt) === today).map((attempt) => attempt.expressionId));
}

export function nextListeningReviewAt(rating: ReviewRating, now = new Date()) {
  const next = new Date(now);
  if (rating === "again") next.setMinutes(next.getMinutes() + 15);
  else if (rating === "hard") next.setDate(next.getDate() + 1);
  else next.setDate(next.getDate() + (rating === "easy" ? 14 : 7));
  return next.toISOString();
}

function latestListeningAttempts(attempts: PracticeAttempt[]) {
  const latest = new Map<string, PracticeAttempt>();
  for (const attempt of attempts) {
    if (attempt.questionType !== "listening") continue;
    const current = latest.get(attempt.expressionId);
    if (!current || current.attemptedAt < attempt.attemptedAt) latest.set(attempt.expressionId, attempt);
  }
  return latest;
}

export function listeningDueExpressions(
  expressions: Expression[],
  progress: Record<string, ExpressionProgress>,
  attempts: PracticeAttempt[],
  now = new Date(),
) {
  const latest = latestListeningAttempts(attempts);
  return expressions.filter((expression) => {
    if (!progress[expression.id]?.reviewCount) return false;
    const attempt = latest.get(expression.id);
    return !attempt?.nextListeningAt || new Date(attempt.nextListeningAt) <= now;
  });
}

export function weeklyActivity(attempts: PracticeAttempt[], summaries: SessionSummary[], now = new Date()) {
  const weekStart = startOfWeek(now);
  const recentAttempts = attempts.filter((attempt) => new Date(attempt.attemptedAt) >= weekStart);
  const recentSummaries = summaries.filter((summary) => new Date(summary.completedAt) >= weekStart);
  const activeExpressions = new Set(recentAttempts.filter((attempt) => attempt.becameActive).map((attempt) => attempt.expressionId));
  const studyDays = new Set([
    ...recentAttempts.map((attempt) => localDayKey(attempt.attemptedAt)),
    ...recentSummaries.map((summary) => localDayKey(summary.completedAt)),
  ]);
  return {
    activeGained: activeExpressions.size,
    reviews: recentAttempts.length,
    studyDays: studyDays.size,
  };
}

export function activeCount(progress: Record<string, ExpressionProgress>) {
  return Object.values(progress).filter((item) => activeStatuses.has(item.status)).length;
}
