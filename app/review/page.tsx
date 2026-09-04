"use client";

import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { BookOpen, Headphones, RotateCcw, Star } from "@/components/icons";
import { LoadingScreen } from "@/components/loading-screen";
import { PageHeading } from "@/components/page-heading";
import { usePhraseChu } from "@/context/app-context";
import type { StudySession } from "@/types/domain";

export default function ReviewPage() {
  const router = useRouter();
  const { ready, dueCount, hardCount, learnedCount, favorites, startSession } = usePhraseChu();
  if (!ready) return <div className="page"><LoadingScreen /></div>;

  const launch = async (kind: StudySession["kind"]) => { if (await startSession(kind)) router.push("/session"); };
  const cards = [
    { label: "Due", count: dueCount, icon: RotateCcw, kind: "due" as const },
    { label: "Hard", count: hardCount, icon: BookOpen, kind: "hard" as const },
    { label: "Listening", count: Math.min(12, learnedCount), icon: Headphones, kind: "listening" as const },
    { label: "Favorites", count: favorites.length, icon: Star, kind: "favorite" as const },
  ];
  return (
    <div className="page">
      <AppHeader />
      <PageHeading eyebrow="Make it active" title="Review" description="Spend time where your memory needs it most." />
      <div className="review-grid">{cards.map(({ label, count, icon: Icon, kind }) => (
        <button className="review-card" key={kind} disabled={count === 0} onClick={() => launch(kind)}><span className="review-icon"><Icon size={20} /></span><strong>{count}</strong><span>{label}</span></button>
      ))}</div>
      {learnedCount === 0 ? <div className="empty-state" style={{ marginTop: 18 }}><strong>Your review queue is clear</strong><p>Start today&apos;s session to add your first expressions.</p></div> : dueCount === 0 && <div className="empty-state" style={{ marginTop: 18 }}><strong>You&apos;re all caught up ✓</strong><p>Hard and favorite phrases are still available anytime.</p></div>}
      <div className="insight-card"><p>Recognition feels familiar. Recall makes an expression available when you need it.</p></div>
    </div>
  );
}
