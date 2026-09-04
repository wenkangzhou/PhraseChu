import { expressions } from "@/lib/data/expressions";
import { createProgress } from "@/lib/srs";
import type { AppSettings, Expression, ExpressionProgress, StudySession } from "@/types/domain";

export interface PhraseChuRepository {
  getExpressions(): Promise<Expression[]>;
  getExpression(id: string): Promise<Expression | null>;
  getAllProgress(): Promise<Record<string, ExpressionProgress>>;
  getProgress(expressionId: string): Promise<ExpressionProgress>;
  saveProgress(progress: ExpressionProgress): Promise<void>;
  getFavorites(): Promise<string[]>;
  toggleFavorite(expressionId: string): Promise<string[]>;
  getSettings(): Promise<AppSettings>;
  saveSettings(settings: AppSettings): Promise<void>;
  getSession(): Promise<StudySession | null>;
  saveSession(session: StudySession | null): Promise<void>;
}

const KEYS = {
  progress: "phrasechu.progress.v1",
  favorites: "phrasechu.favorites.v1",
  settings: "phrasechu.settings.v1",
  session: "phrasechu.session.v1",
};

const canUseStorage = () => typeof window !== "undefined" && Boolean(window.localStorage);

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
  if (canUseStorage()) window.localStorage.setItem(key, JSON.stringify(value));
}

export class LocalRepository implements PhraseChuRepository {
  async getExpressions() { return expressions; }
  async getExpression(id: string) { return expressions.find((item) => item.id === id) ?? null; }
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
}

export const repository = new LocalRepository();
