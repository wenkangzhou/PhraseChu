"use client";

import { Headphones, VolumeX } from "@/components/icons";
import { usePhraseChu } from "@/context/app-context";

export function ModeSwitcher() {
  const { settings, updateSettings } = usePhraseChu();
  return (
    <div className="mode-switcher" role="group" aria-label="Study environment">
      <button
        className={settings.mode === "silent" ? "active" : ""}
        onClick={() => updateSettings({ ...settings, mode: "silent" })}
        aria-pressed={settings.mode === "silent"}
      >
        <VolumeX size={16} /> Silent
      </button>
      <button
        className={settings.mode === "listen" ? "active" : ""}
        onClick={() => updateSettings({ ...settings, mode: "listen" })}
        aria-pressed={settings.mode === "listen"}
      >
        <Headphones size={16} /> Listen
      </button>
    </div>
  );
}
