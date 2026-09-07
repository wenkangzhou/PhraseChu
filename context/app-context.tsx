"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { expressions as seedExpressions } from "@/lib/data/expressions";
import { activeCount as countActive, listeningDueExpressions, nextListeningReviewAt, weeklyActivity } from "@/lib/activity";
import { repository } from "@/lib/repository";
import { generateSession, getDailyPlan, type DailyPlan } from "@/lib/session-generator";
import { applyReview, createProgress, isDue } from "@/lib/srs";
import type {
  AppSettings,
  Expression,
  ExpressionProgress,
  PracticeAttempt,
  PracticeQuestion,
  ReviewRating,
  SessionSummary,
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
  listeningDueCount: number;
  dailyPlan: DailyPlan;
  weeklyStats: ReturnType<typeof weeklyActivity>;
  startSession: (kind: StudySession["kind"], scenarioId?: string) => Promise<boolean>;
  answerQuestion: (question: PracticeQuestion, rating: ReviewRating) => Promise<void>;
  skipQuestion: () => Promise<void>;
  clearSession: () => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  updateSettings: (settings: AppSettings) => Promise<void>;
  addPersonalExpression: (input: { meaning: string; natural: string; casual: string; note?: string }) => Promise<Expression>;
}

const AppContext = createContext<AppContextValue | null>(null);

function summaryFor(session: StudySession, progress: Record<string, ExpressionProgress>): SessionSummary {
  return {
    id: session.id,
    kind: session.kind,
    startedAt: session.startedAt,
    completedAt: session.completedAt ?? new Date().toISOString(),
    questionCount: session.questionIds.length,
    answeredCount: session.answeredCount ?? 0,
    correctCount: session.correctCount ?? 0,
    skippedCount: session.skippedCount ?? 0,
    newCount: session.newCount,
    reviewCount: session.reviewCount,
    activeGain: Math.max(0, countActive(progress) - session.initialActiveCount),
  };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [expressions, setExpressions] = useState(seedExpressions);
  const [progress, setProgress] = useState<Record<string, ExpressionProgress>>({});
  const [favorites, setFavorites] = useState<string[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ mode: "silent", newPerDay: 5 });
  const [session, setSession] = useState<StudySession | null>(null);
  const [attempts, setAttempts] = useState<PracticeAttempt[]>([]);
  const [sessionSummaries, setSessionSummaries] = useState<SessionSummary[]>([]);

  useEffect(() => {
    let active = true;
    Promise.all([
      repository.getExpressions(),
      repository.getAllProgress(),
      repository.getFavorites(),
      repository.getSettings(),
      repository.getSession(),
      repository.getAttempts(),
      repository.getSessionSummaries(),
    ]).then(
      ([savedExpressions, savedProgress, savedFavorites, savedSettings, savedSession, savedAttempts, savedSummaries]) => {
        if (!active) return;
        setExpressions(savedExpressions);
        setProgress(savedProgress);
        setFavorites(savedFavorites);
        setSettings(savedSettings);
        setSession(savedSession ? {
          ...savedSession,
          answeredCount: savedSession.answeredCount ?? 0,
          correctCount: savedSession.correctCount ?? 0,
          skippedCount: savedSession.skippedCount ?? 0,
        } : null);
        setAttempts(savedAttempts);
        setSessionSummaries(savedSummaries);
        setReady(true);
      },
    );
    return () => { active = false; };
  }, []);

  const startSession = useCallback(async (kind: StudySession["kind"], scenarioId?: string) => {
    const next = generateSession(expressions, kind, progress, favorites, settings, attempts, scenarioId);
    if (!next) return false;
    setSession(next);
    await repository.saveSession(next);
    return true;
  }, [attempts, expressions, favorites, progress, settings]);

  const answerQuestion = useCallback(async (question: PracticeQuestion, rating: ReviewRating) => {
    if (!session) return;
    const current = progress[question.expressionId] ?? createProgress(question.expressionId);
    const now = new Date();
    const updated = applyReview(current, rating, question.type, now);
    const correct = rating !== "again";
    const completed = session.currentIndex + 1 >= session.questionIds.length;
    const nextSession = {
      ...session,
      currentIndex: Math.min(session.currentIndex + 1, session.questionIds.length),
      completed,
      completedAt: completed ? now.toISOString() : session.completedAt,
      answeredCount: (session.answeredCount ?? 0) + 1,
      correctCount: (session.correctCount ?? 0) + (correct ? 1 : 0),
      skippedCount: session.skippedCount ?? 0,
    };
    const wasActive = current.status === "active" || current.status === "mastered";
    const isActive = updated.status === "active" || updated.status === "mastered";
    const attempt: PracticeAttempt = {
      id: `${session.id}:${session.currentIndex}:${now.getTime()}`,
      sessionId: session.id,
      expressionId: question.expressionId,
      questionType: question.type,
      rating,
      correct,
      wasNew: current.reviewCount === 0,
      becameActive: !wasActive && isActive,
      attemptedAt: now.toISOString(),
      nextListeningAt: question.type === "listening" ? nextListeningReviewAt(rating, now) : undefined,
    };
    const nextProgress = { ...progress, [updated.expressionId]: updated };
    const nextAttempts = [...attempts, attempt].slice(-5000);
    setProgress(nextProgress);
    setSession(nextSession);
    setAttempts(nextAttempts);
    const writes: Promise<void>[] = [repository.saveProgress(updated), repository.saveSession(nextSession), repository.saveAttempt(attempt)];
    if (completed) {
      const summary = summaryFor(nextSession, nextProgress);
      setSessionSummaries((current) => [...current.filter((item) => item.id !== summary.id), summary].slice(-500));
      writes.push(repository.saveSessionSummary(summary));
    }
    await Promise.all(writes);
  }, [attempts, progress, session]);

  const skipQuestion = useCallback(async () => {
    if (!session) return;
    const completed = session.currentIndex + 1 >= session.questionIds.length;
    const nextSession = {
      ...session,
      currentIndex: Math.min(session.currentIndex + 1, session.questionIds.length),
      completed,
      completedAt: completed ? new Date().toISOString() : session.completedAt,
      answeredCount: session.answeredCount ?? 0,
      correctCount: session.correctCount ?? 0,
      skippedCount: (session.skippedCount ?? 0) + 1,
    };
    setSession(nextSession);
    const writes: Promise<void>[] = [repository.saveSession(nextSession)];
    if (completed) {
      const summary = summaryFor(nextSession, progress);
      setSessionSummaries((current) => [...current.filter((item) => item.id !== summary.id), summary].slice(-500));
      writes.push(repository.saveSessionSummary(summary));
    }
    await Promise.all(writes);
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

  const addPersonalExpression = useCallback(async ({ meaning, natural, casual, note }: { meaning: string; natural: string; casual: string; note?: string }) => {
    const existing = expressions.find((item) => item.text.trim().toLowerCase() === natural.trim().toLowerCase());
    if (existing) {
      if (existing.savedToPersonal) return existing;
      const saved = { ...existing, savedToPersonal: true };
      await repository.saveExpression(saved);
      setExpressions((current) => current.map((item) => item.id === saved.id ? saved : item));
      return saved;
    }
    const id = `personal-${Date.now()}`;
    const expression: Expression = {
      id,
      text: natural.trim(),
      meaning: meaning.trim(),
      level: "B1",
      themeId: "daily-life",
      scenarioId: "personal",
      frequency: 8,
      usefulness: 10,
      examples: [{ id: `${id}-example`, english: natural.trim(), chinese: meaning.trim() }],
      variants: casual.trim() && casual.trim().toLowerCase() !== natural.trim().toLowerCase()
        ? [{ id: `${id}-variant`, text: casual.trim(), meaning: meaning.trim(), note: "A more casual option." }]
        : [],
      notes: note?.trim() || "Saved from Ask PhraseChu.",
      tags: ["personal", "ai", "daily-life"],
      source: "ai",
      savedToPersonal: true,
      createdAt: new Date().toISOString(),
    };
    await repository.saveExpression(expression);
    setExpressions((current) => [...current, expression]);
    return expression;
  }, [expressions]);

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

  const listeningDueCount = useMemo(() => listeningDueExpressions(expressions, progress, attempts).length, [attempts, expressions, progress]);
  const weeklyStats = useMemo(() => weeklyActivity(attempts, sessionSummaries), [attempts, sessionSummaries]);
  const dailyPlan = useMemo(() => {
    if (!session) return getDailyPlan(expressions, progress, favorites, settings, attempts);
    const listeningCount = session.questionIds.filter((id) => id.startsWith("q2|listening|")).length;
    return {
      newCount: session.newCount,
      reviewCount: session.reviewCount,
      listeningCount,
      questionCount: session.questionIds.length,
      estimatedMinutes: session.questionIds.length ? Math.max(1, Math.ceil(session.questionIds.length * .45)) : 0,
    };
  }, [attempts, expressions, favorites, progress, session, settings]);

  const value = useMemo(() => ({
    ready,
    expressions,
    progress,
    favorites,
    settings,
    session,
    ...metrics,
    listeningDueCount,
    weeklyStats,
    dailyPlan,
    startSession,
    answerQuestion,
    skipQuestion,
    clearSession,
    toggleFavorite,
    updateSettings,
    addPersonalExpression,
  }), [addPersonalExpression, answerQuestion, clearSession, dailyPlan, expressions, favorites, listeningDueCount, metrics, progress, ready, session, settings, skipQuestion, startSession, toggleFavorite, updateSettings, weeklyStats]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function usePhraseChu() {
  const value = useContext(AppContext);
  if (!value) throw new Error("usePhraseChu must be used inside AppProvider");
  return value;
}
