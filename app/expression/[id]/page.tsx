"use client";

import { useParams, useRouter } from "next/navigation";
import { BackButton } from "@/components/back-button";
import { ChevronRight, Star, Volume2 } from "@/components/icons";
import { LoadingScreen } from "@/components/loading-screen";
import { StatusPill } from "@/components/status-pill";
import { usePhraseChu } from "@/context/app-context";
import { scenarioById, themeById } from "@/lib/data/catalog";
import { createProgress } from "@/lib/srs";

export default function ExpressionPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { ready, expressions, progress, favorites, toggleFavorite, startSession } = usePhraseChu();
  if (!ready) return <div className="page"><LoadingScreen /></div>;
  const expression = expressions.find((item) => item.id === id);
  if (!expression) return <div className="page"><div className="empty-state"><strong>Expression not found</strong></div></div>;
  const scenario = scenarioById(expression.scenarioId);
  const theme = themeById(expression.themeId);
  const favorite = favorites.includes(id);
  const speak = () => {
    if (!("speechSynthesis" in window)) return;
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(expression.text);
    utterance.lang = "en-US";
    utterance.rate = .9;
    speechSynthesis.speak(utterance);
  };
  const practice = async () => { if (await startSession("scenario", expression.scenarioId)) router.push("/session"); };
  return (
    <div className="page">
      <div className="detail-header"><BackButton /><h1>Expression</h1><button className="icon-button" onClick={speak} aria-label="Play pronunciation"><Volume2 size={20} /></button></div>
      <div className="detail-copy"><p className="eyebrow">{theme?.title} · {scenario?.title}</p><h1>{expression.text}</h1><p>{expression.meaning}</p><div style={{ marginTop: 14 }}><StatusPill status={(progress[id] ?? createProgress(id)).status} /></div></div>
      <section className="detail-card"><h2>Example</h2><strong>{expression.examples[0].english}</strong><p>{expression.examples[0].chinese}</p></section>
      {expression.variants.map((variant) => <section className="detail-card" key={variant.id}><h2>Natural variation</h2><strong>{variant.text}</strong><p>{variant.meaning}</p></section>)}
      {expression.notes && <section className="detail-card"><h2>Note</h2><p style={{ marginTop: 0 }}>{expression.notes}</p></section>}
      <div className="detail-actions"><button className="icon-button" onClick={() => toggleFavorite(id)} aria-label={favorite ? "Remove favorite" : "Add favorite"} style={favorite ? { background: "#fff3b8", borderColor: "#f1c500" } : undefined}><Star size={21} fill={favorite ? "currentColor" : "none"} /></button><button className="primary-button" onClick={practice}>Practice<ChevronRight size={18} /></button></div>
    </div>
  );
}
