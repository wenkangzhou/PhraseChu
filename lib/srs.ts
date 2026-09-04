import type { ExpressionProgress, ExpressionStatus, QuestionType, ReviewRating } from "@/types/domain";

const ratingDelta: Record<ReviewRating, number> = {
  again: -10,
  hard: 5,
  good: 15,
  easy: 20,
};

const recognitionDelta: Partial<Record<QuestionType, number>> = {
  cloze: 8,
  reorder: 8,
  scenario: 8,
  variation: 5,
  listening: 5,
};

export function createProgress(expressionId: string): ExpressionProgress {
  return {
    expressionId,
    status: "new",
    mastery: 0,
    reviewCount: 0,
    successCount: 0,
    recallSuccessCount: 0,
    streak: 0,
  };
}

export function statusFor(mastery: number, recallSuccessCount: number): ExpressionStatus {
  if (mastery >= 90 && recallSuccessCount >= 2) return "mastered";
  if (mastery >= 70 && recallSuccessCount >= 2) return "active";
  if (mastery >= 40) return "familiar";
  if (mastery >= 20) return "learning";
  return "new";
}

function nextIntervalDays(rating: ReviewRating, streak: number): number {
  if (rating === "again") return 0;
  if (rating === "hard") return 1;
  const ladder = [1, 3, 7, 14, 30, 60];
  const baseIndex = Math.min(Math.max(streak, 0), ladder.length - 1);
  const interval = ladder[baseIndex];
  return rating === "easy" ? Math.max(7, interval) : Math.max(3, interval);
}

export function applyReview(
  current: ExpressionProgress,
  rating: ReviewRating,
  questionType: QuestionType,
  now = new Date(),
): ExpressionProgress {
  const correct = rating !== "again";
  const delta = questionType === "recall" ? ratingDelta[rating] : correct ? recognitionDelta[questionType] ?? 5 : -8;
  const mastery = Math.max(0, Math.min(100, current.mastery + delta));
  const recallSuccessCount = current.recallSuccessCount + (questionType === "recall" && correct ? 1 : 0);
  const streak = correct ? current.streak + 1 : 0;
  const next = new Date(now);

  if (rating === "again") next.setMinutes(next.getMinutes() + 15);
  else next.setDate(next.getDate() + nextIntervalDays(rating, streak));

  return {
    ...current,
    mastery,
    status: statusFor(mastery, recallSuccessCount),
    reviewCount: current.reviewCount + 1,
    successCount: current.successCount + (correct ? 1 : 0),
    recallSuccessCount,
    streak,
    lastReviewedAt: now.toISOString(),
    nextReviewAt: next.toISOString(),
    lastResult: rating,
  };
}

export function isDue(progress: ExpressionProgress, now = new Date()): boolean {
  return Boolean(progress.nextReviewAt && new Date(progress.nextReviewAt) <= now);
}
