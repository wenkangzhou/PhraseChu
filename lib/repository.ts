import { expressions as seedExpressions } from "@/lib/data/expressions";
import { applyReview, createProgress } from "@/lib/srs";
import type { AppSettings, Expression, ExpressionProgress, PracticeAttempt, SessionSummary, StudySession } from "@/types/domain";

export interface PhraseChuBackup {
  format: "phrasechu-backup";
  version: 1;
  exportedAt: string;
  data: {
    progress: Record<string, ExpressionProgress>;
    favorites: string[];
    settings: AppSettings;
    session: StudySession | null;
    personalExpressions: Expression[];
    personalExpressionIds: string[];
    attempts: PracticeAttempt[];
    sessionSummaries: SessionSummary[];
  };
}

export interface BackupImportResult {
  progressCount: number;
  favoriteCount: number;
  personalExpressionCount: number;
  attemptCount: number;
  sessionCount: number;
}

export interface PhraseChuRepository {
  getExpressions(): Promise<Expression[]>;
  getExpression(id: string): Promise<Expression | null>;
  saveExpression(expression: Expression): Promise<void>;
  getAllProgress(): Promise<Record<string, ExpressionProgress>>;
  getProgress(expressionId: string): Promise<ExpressionProgress>;
  saveProgress(progress: ExpressionProgress): Promise<void>;
  getFavorites(): Promise<string[]>;
  toggleFavorite(expressionId: string): Promise<string[]>;
  getSettings(): Promise<AppSettings>;
  saveSettings(settings: AppSettings): Promise<void>;
  getSession(): Promise<StudySession | null>;
  saveSession(session: StudySession | null): Promise<void>;
  getAttempts(): Promise<PracticeAttempt[]>;
  saveAttempt(attempt: PracticeAttempt): Promise<void>;
  getSessionSummaries(): Promise<SessionSummary[]>;
  saveSessionSummary(summary: SessionSummary): Promise<void>;
  createBackup(): Promise<PhraseChuBackup>;
  importBackup(value: unknown): Promise<BackupImportResult>;
}

const KEYS = {
  progress: "phrasechu.progress.v1",
  favorites: "phrasechu.favorites.v1",
  settings: "phrasechu.settings.v1",
  session: "phrasechu.session.v1",
  personalExpressions: "phrasechu.personal-expressions.v1",
  personalExpressionIds: "phrasechu.personal-expression-ids.v1",
  attempts: "phrasechu.practice-attempts.v1",
  sessionSummaries: "phrasechu.session-summaries.v1",
};

const canUseStorage = () => typeof window !== "undefined";

function read<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback;
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // The app remains usable when storage is disabled or full.
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

const progressStatuses = new Set(["new", "learning", "familiar", "active", "mastered"]);
const reviewRatings = new Set(["again", "hard", "good", "easy"]);
const questionTypes = new Set(["recall", "cloze", "reorder", "scenario", "variation", "listening"]);
const sessionKinds = new Set(["daily", "quick", "scenario", "due", "hard", "weak", "favorite", "listening"]);
const expressionLevels = new Set(["A2", "B1", "B2", "C1"]);
const expressionSources = new Set(["seed", "personal", "ai"]);

function isOptionalString(value: unknown) {
  return value === undefined || typeof value === "string";
}

function isProgress(value: unknown): value is ExpressionProgress {
  return isRecord(value)
    && typeof value.expressionId === "string"
    && typeof value.status === "string" && progressStatuses.has(value.status)
    && typeof value.mastery === "number"
    && typeof value.reviewCount === "number"
    && typeof value.successCount === "number"
    && typeof value.recallSuccessCount === "number"
    && typeof value.streak === "number"
    && isOptionalString(value.lastReviewedAt)
    && isOptionalString(value.nextReviewAt)
    && (value.lastResult === undefined || typeof value.lastResult === "string" && reviewRatings.has(value.lastResult));
}

function isExpression(value: unknown): value is Expression {
  return isRecord(value)
    && typeof value.id === "string"
    && typeof value.text === "string"
    && typeof value.meaning === "string"
    && typeof value.level === "string" && expressionLevels.has(value.level)
    && typeof value.themeId === "string"
    && typeof value.scenarioId === "string"
    && typeof value.frequency === "number"
    && typeof value.usefulness === "number"
    && Array.isArray(value.examples) && value.examples.every((item) => isRecord(item) && typeof item.id === "string" && typeof item.english === "string" && typeof item.chinese === "string")
    && Array.isArray(value.variants) && value.variants.every((item) => isRecord(item) && typeof item.id === "string" && typeof item.text === "string" && typeof item.meaning === "string")
    && isStringArray(value.tags)
    && typeof value.source === "string" && expressionSources.has(value.source)
    && typeof value.createdAt === "string";
}

function isAttempt(value: unknown): value is PracticeAttempt {
  return isRecord(value)
    && typeof value.id === "string"
    && typeof value.sessionId === "string"
    && typeof value.expressionId === "string"
    && typeof value.questionType === "string" && questionTypes.has(value.questionType)
    && typeof value.rating === "string" && reviewRatings.has(value.rating)
    && typeof value.correct === "boolean"
    && typeof value.wasNew === "boolean"
    && typeof value.becameActive === "boolean"
    && typeof value.attemptedAt === "string"
    && Number.isFinite(Date.parse(value.attemptedAt));
}

function isSession(value: unknown): value is StudySession | null {
  if (value === null) return true;
  return isRecord(value)
    && typeof value.id === "string"
    && typeof value.kind === "string" && sessionKinds.has(value.kind)
    && isStringArray(value.questionIds)
    && isStringArray(value.expressionIds)
    && typeof value.currentIndex === "number"
    && typeof value.startedAt === "string" && Number.isFinite(Date.parse(value.startedAt))
    && typeof value.completed === "boolean"
    && isOptionalString(value.completedAt)
    && typeof value.newCount === "number"
    && typeof value.reviewCount === "number"
    && typeof value.initialActiveCount === "number"
    && typeof value.answeredCount === "number"
    && typeof value.correctCount === "number"
    && typeof value.skippedCount === "number";
}

function isSummary(value: unknown): value is SessionSummary {
  return isRecord(value)
    && typeof value.id === "string"
    && typeof value.kind === "string" && sessionKinds.has(value.kind)
    && typeof value.startedAt === "string" && Number.isFinite(Date.parse(value.startedAt))
    && typeof value.completedAt === "string" && Number.isFinite(Date.parse(value.completedAt))
    && typeof value.questionCount === "number"
    && typeof value.answeredCount === "number"
    && typeof value.correctCount === "number"
    && typeof value.skippedCount === "number"
    && typeof value.newCount === "number"
    && typeof value.reviewCount === "number"
    && typeof value.activeGain === "number";
}

function isSettings(value: unknown): value is AppSettings {
  return isRecord(value)
    && (value.mode === "silent" || value.mode === "listen")
    && (value.newPerDay === 3 || value.newPerDay === 5 || value.newPerDay === 8 || value.newPerDay === 10);
}

function parseBackup(value: unknown): PhraseChuBackup {
  if (!isRecord(value)
    || value.format !== "phrasechu-backup"
    || value.version !== 1
    || typeof value.exportedAt !== "string"
    || !Number.isFinite(Date.parse(value.exportedAt))
    || !isRecord(value.data)) {
    throw new Error("This is not a PhraseChu backup file.");
  }
  const data = value.data;
  if (!isRecord(data.progress)
    || !Object.values(data.progress).every(isProgress)
    || !isStringArray(data.favorites)
    || !isSettings(data.settings)
    || !isSession(data.session)
    || !Array.isArray(data.personalExpressions) || !data.personalExpressions.every(isExpression)
    || !isStringArray(data.personalExpressionIds)
    || !Array.isArray(data.attempts) || !data.attempts.every(isAttempt)
    || !Array.isArray(data.sessionSummaries) || !data.sessionSummaries.every(isSummary)) {
    throw new Error("This PhraseChu backup is incomplete or damaged.");
  }
  return value as unknown as PhraseChuBackup;
}

function mergeById<T extends { id: string }>(current: T[], incoming: T[]) {
  return [...new Map([...current, ...incoming].map((item) => [item.id, item])).values()];
}

function preferredProgress(current?: ExpressionProgress, incoming?: ExpressionProgress) {
  if (!current) return incoming;
  if (!incoming) return current;
  if (current.reviewCount !== incoming.reviewCount) return current.reviewCount > incoming.reviewCount ? current : incoming;
  return (current.lastReviewedAt ?? "") >= (incoming.lastReviewedAt ?? "") ? current : incoming;
}

function mergedProgress(
  current: Record<string, ExpressionProgress>,
  incoming: Record<string, ExpressionProgress>,
  attempts: PracticeAttempt[],
) {
  const attemptsByExpression = new Map<string, PracticeAttempt[]>();
  for (const attempt of attempts) {
    attemptsByExpression.set(attempt.expressionId, [...(attemptsByExpression.get(attempt.expressionId) ?? []), attempt]);
  }
  const ids = new Set([...Object.keys(current), ...Object.keys(incoming), ...attemptsByExpression.keys()]);
  const result = Object.create(null) as Record<string, ExpressionProgress>;
  for (const id of ids) {
    const fallback = preferredProgress(current[id], incoming[id]) ?? createProgress(id);
    const events = (attemptsByExpression.get(id) ?? []).sort((a, b) => a.attemptedAt.localeCompare(b.attemptedAt));
    if (events.length < fallback.reviewCount) {
      result[id] = fallback;
      continue;
    }
    result[id] = events.reduce(
      (progress, attempt) => applyReview(progress, attempt.rating, attempt.questionType, new Date(attempt.attemptedAt)),
      createProgress(id),
    );
  }
  return result;
}

export class LocalRepository implements PhraseChuRepository {
  async getExpressions() {
    const savedIds = read<string[]>(KEYS.personalExpressionIds, []);
    const savedSeeds = seedExpressions.map((item) => savedIds.includes(item.id) ? { ...item, savedToPersonal: true } : item);
    return [...savedSeeds, ...read<Expression[]>(KEYS.personalExpressions, [])];
  }
  async getExpression(id: string) {
    return (await this.getExpressions()).find((item) => item.id === id) ?? null;
  }
  async saveExpression(expression: Expression) {
    if (seedExpressions.some((item) => item.id === expression.id)) {
      const savedIds = read<string[]>(KEYS.personalExpressionIds, []);
      if (!savedIds.includes(expression.id)) write(KEYS.personalExpressionIds, [...savedIds, expression.id]);
      return;
    }
    const current = read<Expression[]>(KEYS.personalExpressions, []);
    const next = [...current.filter((item) => item.id !== expression.id), expression];
    write(KEYS.personalExpressions, next);
  }
  async getAllProgress() { return read<Record<string, ExpressionProgress>>(KEYS.progress, {}); }
  async getProgress(expressionId: string) {
    const all = await this.getAllProgress();
    return all[expressionId] ?? createProgress(expressionId);
  }
  async saveProgress(progress: ExpressionProgress) {
    const all = await this.getAllProgress();
    write(KEYS.progress, { ...all, [progress.expressionId]: progress });
  }
  async getFavorites() { return read<string[]>(KEYS.favorites, []); }
  async toggleFavorite(expressionId: string) {
    const current = await this.getFavorites();
    const next = current.includes(expressionId) ? current.filter((id) => id !== expressionId) : [...current, expressionId];
    write(KEYS.favorites, next);
    return next;
  }
  async getSettings() { return read<AppSettings>(KEYS.settings, { mode: "silent", newPerDay: 5 }); }
  async saveSettings(settings: AppSettings) { write(KEYS.settings, settings); }
  async getSession() { return read<StudySession | null>(KEYS.session, null); }
  async saveSession(session: StudySession | null) { write(KEYS.session, session); }
  async getAttempts() { return read<PracticeAttempt[]>(KEYS.attempts, []); }
  async saveAttempt(attempt: PracticeAttempt) {
    const current = await this.getAttempts();
    write(KEYS.attempts, [...current, attempt].slice(-5000));
  }
  async getSessionSummaries() { return read<SessionSummary[]>(KEYS.sessionSummaries, []); }
  async saveSessionSummary(summary: SessionSummary) {
    const current = await this.getSessionSummaries();
    write(KEYS.sessionSummaries, [...current.filter((item) => item.id !== summary.id), summary].slice(-500));
  }
  async createBackup(): Promise<PhraseChuBackup> {
    const [progress, favorites, settings, session, attempts, sessionSummaries] = await Promise.all([
      this.getAllProgress(),
      this.getFavorites(),
      this.getSettings(),
      this.getSession(),
      this.getAttempts(),
      this.getSessionSummaries(),
    ]);
    return {
      format: "phrasechu-backup",
      version: 1,
      exportedAt: new Date().toISOString(),
      data: {
        progress,
        favorites,
        settings,
        session,
        personalExpressions: read<Expression[]>(KEYS.personalExpressions, []),
        personalExpressionIds: read<string[]>(KEYS.personalExpressionIds, []),
        attempts,
        sessionSummaries,
      },
    };
  }
  async importBackup(value: unknown): Promise<BackupImportResult> {
    const backup = parseBackup(value);
    const [currentAttempts, currentProgress, currentFavorites, currentSummaries, currentSession] = await Promise.all([
      this.getAttempts(),
      this.getAllProgress(),
      this.getFavorites(),
      this.getSessionSummaries(),
      this.getSession(),
    ]);
    const attempts = mergeById(currentAttempts, backup.data.attempts)
      .sort((a, b) => a.attemptedAt.localeCompare(b.attemptedAt))
      .slice(-5000);
    const progress = mergedProgress(currentProgress, backup.data.progress, attempts);
    const favorites = [...new Set([...currentFavorites, ...backup.data.favorites])];
    const personalExpressions = mergeById(read<Expression[]>(KEYS.personalExpressions, []), backup.data.personalExpressions);
    const personalExpressionIds = [...new Set([...read<string[]>(KEYS.personalExpressionIds, []), ...backup.data.personalExpressionIds])];
    const sessionSummaries = mergeById(currentSummaries, backup.data.sessionSummaries)
      .sort((a, b) => a.completedAt.localeCompare(b.completedAt))
      .slice(-500);
    const sessions = [currentSession, backup.data.session].filter((item): item is StudySession => Boolean(item));
    const session = sessions.sort((a, b) => Number(a.completed) - Number(b.completed) || b.startedAt.localeCompare(a.startedAt))[0] ?? null;

    write(KEYS.progress, progress);
    write(KEYS.favorites, favorites);
    write(KEYS.settings, backup.data.settings);
    write(KEYS.session, session);
    write(KEYS.personalExpressions, personalExpressions);
    write(KEYS.personalExpressionIds, personalExpressionIds);
    write(KEYS.attempts, attempts);
    write(KEYS.sessionSummaries, sessionSummaries);

    return {
      progressCount: Object.keys(progress).length,
      favoriteCount: favorites.length,
      personalExpressionCount: personalExpressions.length + personalExpressionIds.length,
      attemptCount: attempts.length,
      sessionCount: sessionSummaries.length,
    };
  }
}

export const repository = new LocalRepository();
