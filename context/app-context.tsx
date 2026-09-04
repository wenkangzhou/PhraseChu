"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { expressions as seedExpressions } from "@/lib/data/expressions";
import { repository } from "@/lib/repository";
import { generateSession } from "@/lib/session-generator";
import { applyReview, createProgress, isDue } from "@/lib/srs";
import type {
  AppSettings,
  Expression,
  ExpressionProgress,
  PracticeQuestion,
  ReviewRating,
  StudySession,
} from "@/types/domain";

interface AppContextValue {
  ready: boolean;
  expressions: Expression[];
  progress: Record<string, ExpressionProgress>;
  favorites: string[];
  settings: AppSettings;
  session: StudySession | null;
  dueCount: number;
  hardCount: number;
  activeCount: number;
  familiarCount: number;
  learningCount: number;
  learnedCount: number;
  startSession: (kind: StudySession["kind"], scenarioId?: string) => Promise<boolean>;
  answerQuestion: (question: PracticeQuestion, rating: ReviewRating) => Promise<void>;
  clearSession: () => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  updateSettings: (settings: AppSettings) => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [expressions] = useState(seedExpressions);
  const [progress, setProgress] = useState<Record<string, ExpressionProgress>>({});
  const [favorites, setFavorites] = useState<string[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ mode: "silent", newPerDay: 5 });
  const [session, setSession] = useState<StudySession | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([repository.getAllProgress(), repository.getFavorites(), repository.getSettings(), repository.getSession()]).then(
      ([savedProgress, savedFavorites, savedSettings, savedSession]) => {
        if (!active) return;
        setProgress(savedProgress);
        setFavorites(savedFavorites);
        setSettings(savedSettings);
        setSession(savedSession);
        setReady(true);
      },
    );
    return () => { active = false; };
  }, []);

  const startSession = useCallback(async (kind: StudySession["kind"], scenarioId?: string) => {
    const next = generateSession(kind, progress, favorites, settings, scenarioId);
    if (!next) return false;
    setSession(next);
    await repository.saveSession(next);
    return true;
  }, [favorites, progress, settings]);

  const answerQuestion = useCallback(async (question: PracticeQuestion, rating: ReviewRating) => {
    if (!session) return;
    const current = progress[question.expressionId] ?? createProgress(question.expressionId);
    const updated = applyReview(current, rating, question.type);
    const completed = session.currentIndex + 1 >= session.questionIds.length;
    const nextSession = {
      ...session,
      currentIndex: Math.min(session.currentIndex + 1, session.questionIds.length),
      completed,
      completedAt: completed ? new Date().toISOString() : session.completedAt,
    };
    setProgress((all) => ({ ...all, [updated.expressionId]: updated }));
    setSession(nextSession);
    await Promise.all([repository.saveProgress(updated), repository.saveSession(nextSession)]);
  }, [progress, session]);

  const clearSession = useCallback(async () => {
    setSession(null);
    await repository.saveSession(null);
  }, []);

  const toggleFavorite = useCallback(async (id: string) => {
    setFavorites(await repository.toggleFavorite(id));
  }, []);

  const updateSettings = useCallback(async (next: AppSettings) => {
    setSettings(next);
    await repository.saveSettings(next);
  }, []);

  const metrics = useMemo(() => {
    const values = Object.values(progress);
    return {
      dueCount: values.filter((item) => isDue(item)).length,
      hardCount: values.filter((item) => item.lastResult === "hard" || item.lastResult === "again").length,
      activeCount: values.filter((item) => item.status === "active" || item.status === "mastered").length,
      familiarCount: values.filter((item) => item.status === "familiar").length,
      learningCount: values.filter((item) => item.status === "learning" || item.status === "new" && item.reviewCount > 0).length,
      learnedCount: values.filter((item) => item.reviewCount > 0).length,
    };
  }, [progress]);

  const value = useMemo(() => ({
    ready,
    expressions,
    progress,
    favorites,
    settings,
    session,
    ...metrics,
    startSession,
    answerQuestion,
    clearSession,
    toggleFavorite,
    updateSettings,
  }), [answerQuestion, clearSession, expressions, favorites, metrics, progress, ready, session, settings, startSession, toggleFavorite, updateSettings]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function usePhraseChu() {
  const value = useContext(AppContext);
  if (!value) throw new Error("usePhraseChu must be used inside AppProvider");
  return value;
}
