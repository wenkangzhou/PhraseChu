"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppHeader } from "@/components/app-header";
import { ChevronRight, RotateCcw } from "@/components/icons";
import { DataBackup } from "@/components/data-backup";
import { LoadingScreen } from "@/components/loading-screen";
import { ModeSwitcher } from "@/components/mode-switcher";
import { PageHeading } from "@/components/page-heading";
import { usePhraseChu } from "@/context/app-context";
import type { AppSettings, StudySession } from "@/types/domain";

const options: AppSettings["newPerDay"][] = [3, 5, 8, 10];
const sessionLabels: Record<StudySession["kind"], string> = {
  daily: "Daily session",
  quick: "Quick practice",
  scenario: "Scenario practice",
  due: "Due review",
  hard: "Hard expressions",
  weak: "Weak expressions",
  favorite: "Favorites",
  listening: "Listening",
};

export default function MePage() {
  const router = useRouter();
  const [launchingWeak, setLaunchingWeak] = useState(false);
  const { ready, activeCount, familiarCount, learningCount, learnedCount, progress, settings, weeklyStats, learningInsights, recentSessions, startSession, updateSettings } = usePhraseChu();
  if (!ready) return <div className="page"><LoadingScreen /></div>;
  const reviews = Object.values(progress).reduce((sum, item) => sum + item.reviewCount, 0);
  const practiceWeak = async () => {
    setLaunchingWeak(true);
    if (await startSession("weak")) router.push("/session");
    else setLaunchingWeak(false);
  };
  return (
    <div className="page">
      <AppHeader action={<ModeSwitcher />} />
      <PageHeading eyebrow="Your language" title="Progress" description="A quiet record of what you can actually say." />
      <section className="profile-hero"><p className="eyebrow">Active expressions</p><strong>{activeCount}</strong><span>of {learnedCount} expressions learned</span></section>
      <div className="metric-grid">
        <div className="metric-card"><strong>{familiarCount}</strong><span>Familiar</span></div>
        <div className="metric-card"><strong>{learningCount}</strong><span>Learning</span></div>
        <div className="metric-card"><strong>{reviews}</strong><span>Reviews</span></div>
      </div>
      <div className="section-title-row"><h2>This week</h2><span>Since Monday</span></div>
      <div className="metric-grid weekly-metrics">
        <div className="metric-card"><strong>+{weeklyStats.activeGained}</strong><span>Active</span></div>
        <div className="metric-card"><strong>{weeklyStats.reviews}</strong><span>Reviews</span></div>
        <div className="metric-card"><strong>{weeklyStats.accuracy === null ? "—" : `${weeklyStats.accuracy}%`}</strong><span>Accuracy</span></div>
        <div className="metric-card"><strong>{weeklyStats.studyDays}</strong><span>Study days</span></div>
      </div>

      <div className="section-title-row"><h2>Needs attention</h2><span>{learningInsights.length ? "Based on recent answers" : "Nothing yet"}</span></div>
      {learningInsights.length ? <>
        <div className="learning-insight-list">{learningInsights.map(({ expression, mastery, reason }) => (
          <Link className="learning-insight-row" href={`/expression/${expression.id}`} key={expression.id}>
            <div>
              <strong>{expression.text}</strong>
              <span>{reason === "again" ? "Review again" : reason === "hard" ? "Felt hard" : "Still learning"} · {mastery}% mastery</span>
              <span className="mastery-track" role="progressbar" aria-label={`${mastery}% mastery`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={mastery}><i style={{ width: `${mastery}%` }} /></span>
            </div>
            <ChevronRight size={18} />
          </Link>
        ))}</div>
        <button className="secondary-button focus-practice-button" disabled={launchingWeak} onClick={practiceWeak}><RotateCcw size={18} />{launchingWeak ? "Starting…" : `Practice these ${learningInsights.length} phrases`}</button>
      </> : <div className="empty-insight"><strong>Your weak phrases will appear here.</strong><span>Finish a practice session to get a focused review list.</span></div>}

      <div className="section-title-row"><h2>Recent sessions</h2><span>{recentSessions.length ? "Latest first" : "No sessions yet"}</span></div>
      {recentSessions.length ? <div className="recent-session-list">{recentSessions.map((item) => {
        const accuracy = item.answeredCount ? `${Math.round(item.correctCount / item.answeredCount * 100)}%` : "—";
        return <div className="recent-session-row" key={item.id}>
          <div><strong>{sessionLabels[item.kind]}</strong><span>{new Date(item.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })} · {item.answeredCount} answered{item.skippedCount ? ` · ${item.skippedCount} skipped` : ""}</span></div>
          <b>{accuracy}</b>
        </div>;
      })}</div> : <div className="empty-insight"><strong>No completed sessions yet.</strong><span>Your last three sessions will be saved here.</span></div>}

      <section className="settings-card"><h2>New expressions per day</h2><p>Keep the daily session useful and finishable.</p><div className="option-row">{options.map((count) => <button className={settings.newPerDay === count ? "active" : ""} key={count} onClick={() => updateSettings({ ...settings, newPerDay: count })}>{count}</button>)}</div></section>
      <DataBackup />
      <section className="settings-card"><h2>Learning principle</h2><p style={{ marginBottom: 0 }}>Learn less. Say more. Progress comes from recall, not time spent in the app.</p></section>
    </div>
  );
}
