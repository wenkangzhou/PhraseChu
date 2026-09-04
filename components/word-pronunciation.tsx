"use client";

import { useRef, useState } from "react";
import { Search } from "@/components/icons";
import { SpeechButton } from "@/components/speech-button";

interface WordInfo {
  word: string;
  ipa: string;
  partOfSpeech: string;
  meaning: string;
  example: string;
}

const wordCache = new Map<string, WordInfo>();
const wordPattern = /^[A-Za-z]+(?:['’-][A-Za-z]+)*$/u;

function useWordInfo() {
  const [selectedWord, setSelectedWord] = useState("");
  const [info, setInfo] = useState<WordInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const requestIdRef = useRef(0);

  const lookup = async (word: string) => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    const normalized = word.toLowerCase();
    setSelectedWord(word);
    setError("");
    const cached = wordCache.get(normalized);
    if (cached) {
      setInfo(cached);
      setLoading(false);
      return;
    }
    setInfo(null);
    setLoading(true);
    try {
      const response = await fetch("/api/word", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ word }),
      });
      const result = await response.json() as WordInfo & { error?: string };
      if (!response.ok) throw new Error(result.error || "Could not look up this word.");
      wordCache.set(normalized, result);
      if (requestIdRef.current === requestId) setInfo(result);
    } catch (lookupError) {
      if (requestIdRef.current === requestId) setError(lookupError instanceof Error ? lookupError.message : "Could not look up this word.");
    } finally {
      if (requestIdRef.current === requestId) setLoading(false);
    }
  };

  return { selectedWord, info, loading, error, lookup };
}

function WordPanel({ word, info, loading, error }: { word: string; info: WordInfo | null; loading: boolean; error: string }) {
  return (
    <div className="pronunciation-panel" aria-live="polite">
      <div className="pronunciation-heading"><div><strong>{info?.word || word}</strong>{info?.ipa && <span>{info.ipa}</span>}</div><SpeechButton text={word} rate={.82} className="word-speak-button" /></div>
      {loading && <p>Looking up pronunciation…</p>}
      {error && <p className="lookup-error">{error} You can still use Listen.</p>}
      {info && <div className="word-definition"><span>{info.partOfSpeech}</span><p>{info.meaning}</p>{info.example && <small>{info.example}</small>}</div>}
    </div>
  );
}

export function PronounceablePhrase({ text }: { text: string }) {
  const { selectedWord, info, loading, error, lookup } = useWordInfo();
  const parts = text.split(/([A-Za-z]+(?:['’-][A-Za-z]+)*)/u);
  return (
    <>
      <h1 className="pronounceable-phrase" aria-label={text}>{parts.map((part, index) => wordPattern.test(part) ? <button type="button" key={`${part}-${index}`} onClick={() => lookup(part)}>{part}</button> : <span key={`${part}-${index}`}>{part}</span>)}</h1>
      <p className="word-tap-hint">Tap any word for IPA and pronunciation.</p>
      {selectedWord && <WordPanel word={selectedWord} info={info} loading={loading} error={error} />}
    </>
  );
}

export function WordSearchCard({ word }: { word: string }) {
  const { selectedWord, info, loading, error, lookup } = useWordInfo();
  return (
    <section className="word-search-card">
      <div><span>Single word</span><strong>{word}</strong><small>American pronunciation and a concise meaning</small></div>
      {!selectedWord && <button type="button" onClick={() => lookup(word)}><Search size={17} />Look up</button>}
      {selectedWord && <WordPanel word={selectedWord} info={info} loading={loading} error={error} />}
    </section>
  );
}
