"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AppHeader } from "@/components/app-header";
import { AskPhraseChu } from "@/components/ask-phrasechu";
import { ChevronRight, Search } from "@/components/icons";
import { LoadingScreen } from "@/components/loading-screen";
import { PageHeading } from "@/components/page-heading";
import { usePhraseChu } from "@/context/app-context";
import { scenarios, themes } from "@/lib/data/catalog";

export default function ExplorePage() {
  const { ready, expressions, progress } = usePhraseChu();
  const [query, setQuery] = useState("");
  const [themeId, setThemeId] = useState<string | null>(null);
  const searchResults = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return [];
    return expressions.filter((item) => [item.text, item.meaning, item.tags.join(" "), ...item.examples.flatMap((example) => [example.english, example.chinese])].join(" ").toLowerCase().includes(needle)).slice(0, 20);
  }, [expressions, query]);
  if (!ready) return <div className="page"><LoadingScreen /></div>;

  const shownScenarios = themeId ? scenarios.filter((item) => item.themeId === themeId) : [];
  return (
    <div className="page">
      <AppHeader />
      <PageHeading eyebrow="Phrase first" title="Explore" description="Find English for the life you actually live." />
      <label className="search-box"><Search size={19} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search English, 中文, or tags" aria-label="Search expressions" /></label>
      {!query && <AskPhraseChu />}

      {query ? (
        <>
          <div className="section-title-row"><h2>Results</h2><span>{searchResults.length} found</span></div>
          {searchResults.length ? <div className="search-results">{searchResults.map((item) => (
            <Link className="result-card" href={`/expression/${item.id}`} key={item.id}><div><strong>{item.text}</strong><span>{item.meaning}</span></div><ChevronRight size={18} /></Link>
          ))}</div> : <div className="empty-state"><strong>No phrases found</strong><p>Try a shorter word or a Chinese meaning.</p></div>}
        </>
      ) : themeId ? (
        <>
          <div className="section-title-row"><h2>{themes.find((item) => item.id === themeId)?.title}</h2><button className="text-button" onClick={() => setThemeId(null)}>All themes</button></div>
          <div className="scenario-list">{shownScenarios.map((scenario) => {
            const items = expressions.filter((item) => item.scenarioId === scenario.id);
            const active = items.filter((item) => ["active", "mastered"].includes(progress[item.id]?.status)).length;
            return <Link className="scenario-card" href={`/scenario/${scenario.id}`} key={scenario.id}><div><h3>{scenario.title}</h3><p>{scenario.description}</p></div><div className="scenario-progress"><strong>{Math.round((active/items.length)*100)}%</strong><span>{active}/{items.length} active</span></div><ChevronRight size={18} /></Link>;
          })}</div>
        </>
      ) : (
        <>
          <div className="section-title-row"><h2>Choose a theme</h2><span>{expressions.length} expressions</span></div>
          <div className="theme-grid">{themes.map((theme) => (
            <button className="theme-card" id={theme.id} key={theme.id} onClick={() => setThemeId(theme.id)} style={{ textAlign: "left", color: "inherit", cursor: "pointer" }}>
              <span className="theme-icon">{theme.icon}</span><h3>{theme.title}</h3><p>{theme.description}</p>
            </button>
          ))}</div>
        </>
      )}
    </div>
  );
}
