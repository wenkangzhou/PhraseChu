"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { BackButton } from "@/components/back-button";
import { ChevronRight } from "@/components/icons";
import { LevelBadge } from "@/components/level-badge";
import { LoadingScreen } from "@/components/loading-screen";
import { StatusPill } from "@/components/status-pill";
import { usePhraseChu } from "@/context/app-context";
import { scenarioById, themeById } from "@/lib/data/catalog";
import { createProgress } from "@/lib/srs";
import type { Level } from "@/types/domain";

const levelOrder: Level[] = ["A2", "B1", "B2", "C1"];

export default function ScenarioPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { ready, expressions, progress, startSession } = usePhraseChu();
  const [level, setLevel] = useState<Level | null>(null);
  if (!ready) return <div className="page"><LoadingScreen /></div>;
  const scenario = scenarioById(id);
  if (!scenario) return <div className="page"><div className="empty-state"><strong>Scenario not found</strong></div></div>;
  const theme = themeById(scenario.themeId);
  const scenarioItems = expressions.filter((item) => id === "personal" ? item.savedToPersonal : item.scenarioId === id);
  const availableLevels = levelOrder.filter((entry) => scenarioItems.some((item) => item.level === entry));
  const items = level ? scenarioItems.filter((item) => item.level === level) : scenarioItems;
  const practice = async () => { if (await startSession("scenario", id, level ?? undefined)) router.push("/session"); };
  return (
    <div className="page">
      <div className="detail-header"><BackButton /><h1>{scenario.title}</h1><span style={{ width: 44 }} /></div>
      <div className="detail-copy"><p className="eyebrow">{theme?.icon} {theme?.title}</p><h1>{scenario.title}</h1><p>{scenario.description}</p></div>
      {availableLevels.length > 1 && (
        <div className="level-filter-row" role="group" aria-label="Filter by level">
          <button className={`level-chip ${level === null ? "active" : ""}`} onClick={() => setLevel(null)}>All · {scenarioItems.length}</button>
          {availableLevels.map((entry) => (
            <button className={`level-chip ${level === entry ? "active" : ""}`} key={entry} onClick={() => setLevel(entry === level ? null : entry)}>
              {entry} · {scenarioItems.filter((item) => item.level === entry).length}
            </button>
          ))}
        </div>
      )}
      <div className="section-title-row"><h2>{items.length} Expressions</h2><span>Tap to explore</span></div>
      <div className="expression-list">{items.map((item) => (
        <Link className="expression-row" href={`/expression/${item.id}`} key={item.id}><div><strong>{item.text}</strong><p>{item.meaning}</p></div><LevelBadge level={item.level} /><StatusPill status={(progress[item.id] ?? createProgress(item.id)).status} /><ChevronRight size={17} /></Link>
      ))}</div>
      <div style={{ position: "sticky", bottom: 82, paddingTop: 14, background: "linear-gradient(transparent, var(--cream) 20%)" }}><button className="primary-button" onClick={practice} disabled={!items.length}>{level ? `Practice ${level}` : "Practice Scenario"}<ChevronRight size={18} /></button></div>
    </div>
  );
}
