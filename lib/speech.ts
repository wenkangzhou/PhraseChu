export type SpeechPlaybackError = "unsupported" | "failed";

interface SpeakEnglishOptions {
  rate?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: SpeechPlaybackError) => void;
}

let activeUtterance: SpeechSynthesisUtterance | null = null;
let playbackId = 0;

function preferredEnglishVoice(synthesis: SpeechSynthesis) {
  const voices = synthesis.getVoices();
  return voices.find((voice) => voice.lang.toLowerCase() === "en-us" && voice.localService)
    ?? voices.find((voice) => voice.lang.toLowerCase() === "en-us")
    ?? voices.find((voice) => voice.lang.toLowerCase().startsWith("en-"));
}

export function speakEnglish(value: string, options: SpeakEnglishOptions = {}) {
  if (typeof window === "undefined" || !("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
    options.onError?.("unsupported");
    return false;
  }

  const text = value.trim();
  if (!text) {
    options.onError?.("failed");
    return false;
  }

  const synthesis = window.speechSynthesis;
  const previousPlayback = activeUtterance !== null || synthesis.speaking || synthesis.pending;
  const currentPlaybackId = ++playbackId;

  if (previousPlayback) synthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = options.rate ?? .84;
  const voice = preferredEnglishVoice(synthesis);
  if (voice) utterance.voice = voice;

  // Safari can stop an utterance early when nothing retains it after this
  // function returns, so keep the active one alive until playback finishes.
  activeUtterance = utterance;

  utterance.onstart = () => {
    if (currentPlaybackId === playbackId) options.onStart?.();
  };
  utterance.onend = () => {
    if (currentPlaybackId !== playbackId) return;
    activeUtterance = null;
    options.onEnd?.();
  };
  utterance.onerror = (event) => {
    if (currentPlaybackId !== playbackId) return;
    activeUtterance = null;
    if (event.error === "canceled" || event.error === "interrupted") {
      options.onEnd?.();
      return;
    }
    options.onError?.("failed");
  };

  const start = () => {
    if (currentPlaybackId !== playbackId) return;
    if (synthesis.paused) synthesis.resume();
    synthesis.speak(utterance);
    // iOS Safari sometimes leaves the engine paused after an interrupted
    // utterance. Resuming after queueing makes the tap consistently audible.
    if (synthesis.paused) synthesis.resume();
    window.setTimeout(() => {
      if (currentPlaybackId === playbackId && synthesis.paused) synthesis.resume();
    }, 120);
  };

  // cancel() followed by speak() in the same tick is unreliable in Safari.
  // The first playback remains synchronous with the user's tap.
  if (previousPlayback) window.setTimeout(start, 60);
  else start();

  return true;
}
