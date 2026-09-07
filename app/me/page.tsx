"use client";

import { AppHeader } from "@/components/app-header";
import { LoadingScreen } from "@/components/loading-screen";
import { ModeSwitcher } from "@/components/mode-switcher";
import { PageHeading } from "@/components/page-heading";
import { usePhraseChu } from "@/context/app-context";
import type { AppSettings } from "@/types/domain";

const options: AppSettings["newPerDay"][] = [3, 5, 8, 10];

export default function MePage() {
  const { ready, activeCount, familiarCount, learningCount, learnedCount, progress, settings, weeklyStats, updateSettings } = usePhraseChu();
  if (!ready) return <div className="page"><LoadingScreen /></div>;
  const reviews = Object.values(progress).reduce((sum, item) => sum + item.reviewCount, 0);
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
        <div className="metric-card"><strong>{weeklyStats.studyDays}</strong><span>Study days</span></div>
      </div>
      <section className="settings-card"><h2>New expressions per day</h2><p>Keep the daily session useful and finishable.</p><div className="option-row">{options.map((count) => <button className={settings.newPerDay === count ? "active" : ""} key={count} onClick={() => updateSettings({ ...settings, newPerDay: count })}>{count}</button>)}</div></section>
      <section className="settings-card"><h2>Learning principle</h2><p style={{ marginBottom: 0 }}>Learn less. Say more. Progress comes from recall, not time spent in the app.</p></section>
    </div>
  );
}
