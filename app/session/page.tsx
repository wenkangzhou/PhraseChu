"use client";

import { useRouter } from "next/navigation";
import { BackButton } from "@/components/back-button";
import { Check, X } from "@/components/icons";
import { LoadingScreen } from "@/components/loading-screen";
import { QuestionCard } from "@/components/question-card";
import { usePhraseChu } from "@/context/app-context";
import { parseQuestionId } from "@/lib/questions/factory";

export default function SessionPage() {
  const router = useRouter();
  const { ready, session, expressions, activeCount, answerQuestion, skipQuestion, clearSession, startSession } = usePhraseChu();
  if (!ready) return <div className="session-page"><LoadingScreen /></div>;
  if (!session) return <div className="complete"><h1>No session in progress</h1><p>Choose a practice set from Today or Review.</p><button className="primary-button" onClick={() => router.push("/")}>Back to Today</button></div>;

  if (session.completed) {
    const minutes = Math.max(1, Math.round((new Date(session.completedAt ?? session.startedAt).getTime() - new Date(session.startedAt).getTime()) / 60000));
    const activeGain = Math.max(0, activeCount - session.initialActiveCount);
    const done = async () => { await clearSession(); router.push("/"); };
    const more = async () => { await clearSession(); if (await startSession("quick")) router.refresh(); else router.push("/"); };
    return <div className="complete"><div className="complete-mark"><Check size={34} strokeWidth={3} /></div><h1>Nice work.</h1><p>You kept the flow focused and useful.</p><div className="complete-stats"><div><strong>{minutes}</strong><span>Minutes</span></div><div><strong>{session.newCount}</strong><span>New</span></div><div><strong>+{activeGain}</strong><span>Active</span></div></div><button className="primary-button" onClick={done}>Done</button><button className="text-button" onClick={more}>Practice 2 more minutes</button></div>;
  }

  const question = parseQuestionId(session.questionIds[session.currentIndex], expressions);
  const expression = question ? expressions.find((item) => item.id === question.expressionId) : null;
  if (!question || !expression) return <div className="complete"><h1>Question unavailable</h1><button className="primary-button" onClick={() => router.push("/")}>Back to Today</button></div>;
  const progress = Math.round((session.currentIndex / session.questionIds.length) * 100);
  return (
    <div className="session-page">
      <div className="session-top"><BackButton /><span className="session-count">{session.currentIndex + 1} / {session.questionIds.length}</span><button className="icon-button" aria-label="Exit session" onClick={() => router.push("/")}><X size={21} /></button></div>
      <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
      <QuestionCard key={question.id} question={question} expression={expression} onRate={(rating) => answerQuestion(question, rating)} onSkip={skipQuestion} />
    </div>
  );
}
