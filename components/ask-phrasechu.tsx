"use client";

import { FormEvent, useState } from "react";
import { ChevronRight, Sparkles } from "@/components/icons";

interface PhraseResult { natural: string; casual: string; note: string; }

export function AskPhraseChu() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<PhraseResult | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!text.trim() || loading) return;
    setLoading(true); setMessage(""); setResult(null);
    try {
      const response = await fetch("/api/phrase", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text: text.trim() }) });
      const data = await response.json() as PhraseResult & { error?: string };
      if (!response.ok) throw new Error(data.error || "PhraseChu couldn't answer just now.");
      setResult(data);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "PhraseChu couldn't answer just now.");
    } finally { setLoading(false); }
  };
  return (
    <form className="ask-card" onSubmit={submit}>
      <div className="ask-card-title"><Sparkles size={17} />How would you say…</div>
      <div className="ask-input-row"><input value={text} onChange={(event) => setText(event.target.value)} placeholder="我今天应该能搞定" aria-label="Chinese phrase to translate naturally" /><button disabled={loading} aria-label="Ask PhraseChu">{loading ? "…" : <ChevronRight size={20} />}</button></div>
      {message && <p style={{ color: "#ffd4cd", margin: "12px 0 0", fontSize: 13 }}>{message}</p>}
      {result && <div className="ask-result"><span>Natural</span><strong>{result.natural}</strong><span style={{ marginTop: 10 }}>Casual</span><strong>{result.casual}</strong>{result.note && <p>{result.note}</p>}</div>}
    </form>
  );
}
