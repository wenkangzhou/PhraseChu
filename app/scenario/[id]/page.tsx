"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { BackButton } from "@/components/back-button";
import { ChevronRight } from "@/components/icons";
import { LoadingScreen } from "@/components/loading-screen";
import { StatusPill } from "@/components/status-pill";
import { usePhraseChu } from "@/context/app-context";
import { scenarioById, themeById } from "@/lib/data/catalog";
import { createProgress } from "@/lib/srs";

export default function ScenarioPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { ready, expressions, progress, startSession } = usePhraseChu();
  if (!ready) return <div className="page"><LoadingScreen /></div>;
  const scenario = scenarioById(id);
  if (!scenario) return <div className="page"><div className="empty-state"><strong>Scenario not found</strong></div></div>;
  const theme = themeById(scenario.themeId);
  const items = expressions.filter((item) => id === "personal" ? item.savedToPersonal : item.scenarioId === id);
  const practice = async () => { if (await startSession("scenario", id)) router.push("/session"); };
  return (
    <div className="page">
      <div className="detail-header"><BackButton /><h1>{scenario.title}</h1><span style={{ width: 44 }} /></div>
      <div className="detail-copy"><p className="eyebrow">{theme?.icon} {theme?.title}</p><h1>{scenario.title}</h1><p>{scenario.description}</p></div>
      <div className="section-title-row"><h2>{items.length} Expressions</h2><span>Tap to explore</span></div>
      <div className="expression-list">{items.map((item) => (
        <Link className="expression-row" href={`/expression/${item.id}`} key={item.id}><div><strong>{item.text}</strong><p>{item.meaning}</p></div><StatusPill status={(progress[item.id] ?? createProgress(item.id)).status} /><ChevronRight size={17} /></Link>
      ))}</div>
      <div style={{ position: "sticky", bottom: 82, paddingTop: 14, background: "linear-gradient(transparent, var(--cream) 20%)" }}><button className="primary-button" onClick={practice}>Practice Scenario<ChevronRight size={18} /></button></div>
    </div>
  );
}
