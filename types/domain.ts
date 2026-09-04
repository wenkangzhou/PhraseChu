export type Level = "A2" | "B1" | "B2" | "C1";
export type ExpressionSource = "seed" | "personal" | "ai";
export type ExpressionStatus = "new" | "learning" | "familiar" | "active" | "mastered";
export type ReviewRating = "again" | "hard" | "good" | "easy";
export type QuestionType = "recall" | "cloze" | "reorder" | "scenario" | "variation" | "listening";
export type StudyMode = "silent" | "listen";

export interface Example {
  id: string;
  english: string;
  chinese: string;
}

export interface ExpressionVariant {
  id: string;
  text: string;
  meaning: string;
  note?: string;
}

export interface Expression {
  id: string;
  text: string;
  meaning: string;
  level: Level;
  themeId: string;
  scenarioId: string;
  frequency: number;
  usefulness: number;
  examples: Example[];
  variants: ExpressionVariant[];
  notes?: string;
  tags: string[];
  audioUrl?: string;
  source: ExpressionSource;
  createdAt: string;
}

export interface ExpressionProgress {
  expressionId: string;
  status: ExpressionStatus;
  mastery: number;
  reviewCount: number;
  successCount: number;
  recallSuccessCount: number;
  streak: number;
  lastReviewedAt?: string;
  nextReviewAt?: string;
  lastResult?: ReviewRating;
}

export interface Theme {
  id: string;
  title: string;
  icon: string;
  description: string;
}

export interface Scenario {
  id: string;
  title: string;
  themeId: string;
  description: string;
}

export interface PracticeQuestion {
  id: string;
  expressionId: string;
  type: QuestionType;
  prompt: string;
  answer: string;
  options?: string[];
  tokens?: string[];
  explanation?: string;
}

export interface StudySession {
  id: string;
  kind: "daily" | "quick" | "scenario" | "due" | "hard" | "favorite" | "listening";
  questionIds: string[];
  expressionIds: string[];
  currentIndex: number;
  startedAt: string;
  completed: boolean;
  completedAt?: string;
  newCount: number;
  reviewCount: number;
  initialActiveCount: number;
}

export interface AppSettings {
  mode: StudyMode;
  newPerDay: 3 | 5 | 8 | 10;
}
