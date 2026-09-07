import { expressions as seedExpressions } from "@/lib/data/expressions";
import { createProgress } from "@/lib/srs";
import type { AppSettings, Expression, ExpressionProgress, PracticeAttempt, SessionSummary, StudySession } from "@/types/domain";

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
}

export const repository = new LocalRepository();
