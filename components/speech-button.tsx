"use client";

import { useEffect, useState } from "react";
import { Volume2 } from "@/components/icons";
import { prepareEnglishVoices, speakEnglish } from "@/lib/speech";

type PlaybackState = "idle" | "starting" | "playing" | "error";

export function SpeechButton({
  text,
  label = "Listen",
  className = "",
  rate,
  iconOnly = false,
}: {
  text: string;
  label?: string;
  className?: string;
  rate?: number;
  iconOnly?: boolean;
}) {
  const [state, setState] = useState<PlaybackState>("idle");
  useEffect(() => { prepareEnglishVoices(); }, []);
  const visibleLabel = state === "starting" ? "Starting…" : state === "playing" ? "Playing…" : state === "error" ? "Try again" : label;
  const accessibleLabel = state === "error" ? `Audio did not play. Try ${text} again` : state === "playing" ? `Playing ${text}` : `${label}: ${text}`;

  const play = () => {
    setState("starting");
    speakEnglish(text, {
      rate,
      onStart: () => setState("playing"),
      onEnd: () => setState("idle"),
      onError: () => setState("error"),
    });
  };

  return (
    <button
      type="button"
      className={`${className} speech-button ${state === "playing" ? "is-playing" : ""}`.trim()}
      onClick={play}
      aria-label={accessibleLabel}
      title={iconOnly ? accessibleLabel : undefined}
    >
      <Volume2 size={iconOnly ? 20 : 19} />
      {!iconOnly && visibleLabel}
    </button>
  );
}
