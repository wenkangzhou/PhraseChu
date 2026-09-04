"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { ChevronRight, Clock3, Sparkles } from "@/components/icons";
import { LoadingScreen } from "@/components/loading-screen";
import { ModeSwitcher } from "@/components/mode-switcher";
import { usePhraseChu } from "@/context/app-context";
import { themes } from "@/lib/data/catalog";

export default function TodayPage() {
  const router = useRouter();
  const { ready, activeCount, dueCount, learnedCount, settings, session, startSession } = usePhraseChu();

  if (!ready) return <div className="page"><LoadingScreen /></div>;

  const begin = async (kind: "daily" | "quick") => {
    if (await startSession(kind)) router.push("/session");
  };
  const openSession = () => router.push("/session");
  const planTotal = settings.newPerDay + Math.max(dueCount, Math.min(10, learnedCount));
  const listening = settings.mode === "listen" ? Math.min(5, Math.max(1, Math.round(planTotal * .25))) : 0;

  return (
    <div className="page">
      <AppHeader action={<ModeSwitcher />} />

      <section className="hero">
        <p className="greeting">Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}</p>
        <div className="active-stat">
          <div>
            <strong className="active-number">{activeCount}</strong>
            <span className="active-label">Active Expressions</span>
          </div>
          <span className="week-chip">Phrase first</span>
        </div>
      </section>

      <div className="section-title-row"><h2>Today</h2><span>{planTotal ? "Ready when you are" : "All clear"}</span></div>
      <section className="plan-card">
        <div className="plan-stats">
          <div className="plan-stat"><strong>{settings.newPerDay}</strong><span>New</span></div>
          <div className="plan-stat"><strong>{dueCount || Math.min(10, learnedCount)}</strong><span>Review</span></div>
          <div className="plan-stat"><strong>{listening}</strong><span>Listening</span></div>
        </div>
        <div className="plan-time"><Clock3 size={15} /> ≈ {Math.max(3, Math.ceil(planTotal * .45))} min</div>
        {session && !session.completed ? (
          <button className="primary-button" onClick={openSession}>Continue Session · {session.currentIndex}/{session.questionIds.length}<ChevronRight size={19} /></button>
        ) : session?.completed ? (
          <button className="primary-button" onClick={openSession}>View today&apos;s progress<ChevronRight size={19} /></button>
        ) : (
          <button className="primary-button" onClick={() => begin("daily")}>Start Session<ChevronRight size={19} /></button>
        )}
        <button className="secondary-button quick-button" disabled={learnedCount === 0} onClick={() => begin("quick")}><Sparkles size={17} />Quick Practice · 2 min</button>
        {learnedCount === 0 && <p className="notice">Complete your first session to unlock quick review.</p>}
      </section>

      <div className="section-title-row"><h2>Continue learning</h2><Link href="/explore">See all</Link></div>
      <div className="continue-list">
        {themes.slice(0, 6).map((theme) => (
          <Link href={`/explore#${theme.id}`} className="mini-theme" key={theme.id}>
            <span>{theme.icon}</span><strong>{theme.title}</strong><small>Useful phrases</small>
          </Link>
        ))}
      </div>
    </div>
  );
}
