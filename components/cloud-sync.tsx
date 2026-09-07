"use client";

import { useState, type FormEvent } from "react";
import { Cloud, Copy, Eye, EyeOff, RefreshCw, Unplug } from "@/components/icons";
import { usePhraseChu } from "@/context/app-context";

type Notice = { kind: "success" | "error"; message: string } | null;

function relativeSyncTime(value: string | null) {
  if (!value) return "Not synced yet";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Synced";
  return `Last synced ${date.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}`;
}

export function CloudSync() {
  const { cloudSync, connectCloudSync, disconnectCloudSync, enableCloudSync, syncNow } = usePhraseChu();
  const [enteredCode, setEnteredCode] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  const createBackup = async () => {
    setNotice(null);
    try {
      await enableCloudSync();
      setRevealed(true);
      setNotice({ kind: "success", message: "Cloud backup created. Save this code for your other devices." });
    } catch (error) {
      setNotice({ kind: "error", message: error instanceof Error ? error.message : "Could not enable cloud sync." });
    }
  };

  const connect = async (event: FormEvent) => {
    event.preventDefault();
    setNotice(null);
    try {
      await connectCloudSync(enteredCode);
      setEnteredCode("");
      setNotice({ kind: "success", message: "This device is connected and both learning histories were merged." });
    } catch (error) {
      setNotice({ kind: "error", message: error instanceof Error ? error.message : "Could not connect this device." });
    }
  };

  const copyCode = async () => {
    if (!cloudSync.syncCode) return;
    try {
      await navigator.clipboard.writeText(cloudSync.syncCode);
      setNotice({ kind: "success", message: "Sync code copied." });
    } catch {
      setRevealed(true);
      setNotice({ kind: "error", message: "Copy was blocked. Press and hold the code to copy it." });
    }
  };

  const runSync = async () => {
    setNotice(null);
    try {
      await syncNow();
      setNotice({ kind: "success", message: "Learning data is up to date." });
    } catch (error) {
      setNotice({ kind: "error", message: error instanceof Error ? error.message : "Could not sync now." });
    }
  };

  const disconnect = () => {
    disconnectCloudSync();
    setRevealed(false);
    setNotice({ kind: "success", message: "Cloud sync was disconnected on this device." });
  };

  const visibleNotice = notice ?? (cloudSync.error ? { kind: "error" as const, message: cloudSync.error } : null);

  return (
    <section className="settings-card cloud-sync-card">
      <div className="cloud-sync-heading">
        <span><Cloud size={19} /></span>
        <div><h2>Cloud sync</h2><p>Keep your learning history together across devices.</p></div>
      </div>

      {cloudSync.enabled && cloudSync.syncCode ? (
        <>
          <div className="sync-code-panel">
            <div><span>Your sync code</span><code>{revealed ? cloudSync.syncCode : "PC-••••-••••-••••-••••-••••-••••-••••-••••"}</code></div>
            <button aria-label={revealed ? "Hide sync code" : "Show sync code"} className="icon-button" onClick={() => setRevealed((current) => !current)}>{revealed ? <EyeOff size={18} /> : <Eye size={18} />}</button>
          </div>
          <p className="sync-time">{cloudSync.syncing ? "Syncing…" : relativeSyncTime(cloudSync.lastSyncedAt)}</p>
          <div className="backup-actions">
            <button className="secondary-button" disabled={cloudSync.syncing} onClick={copyCode}><Copy size={17} />Copy code</button>
            <button className="secondary-button" disabled={cloudSync.syncing} onClick={runSync}><span className={cloudSync.syncing ? "spinning" : ""}><RefreshCw size={17} /></span>Sync now</button>
          </div>
          <button className="text-button disconnect-sync" disabled={cloudSync.syncing} onClick={disconnect}><Unplug size={15} />Disconnect this device</button>
        </>
      ) : (
        <>
          <button className="primary-button cloud-enable-button" disabled={cloudSync.syncing} onClick={createBackup}><Cloud size={18} />{cloudSync.syncing ? "Creating backup…" : "Enable cloud sync"}</button>
          <div className="sync-divider"><span>or connect another device</span></div>
          <form className="sync-connect-form" onSubmit={connect}>
            <label htmlFor="cloud-sync-code">Sync code</label>
            <input id="cloud-sync-code" autoCapitalize="characters" autoComplete="off" spellCheck={false} value={enteredCode} onChange={(event) => setEnteredCode(event.target.value)} placeholder="PC-XXXX-XXXX-…" />
            <button className="secondary-button" disabled={cloudSync.syncing || !enteredCode.trim()} type="submit">Connect</button>
          </form>
        </>
      )}

      {visibleNotice && <p className={`backup-status ${visibleNotice.kind}`} role="status">{visibleNotice.message}</p>}
      <p className="sync-privacy">Anyone with your sync code can open this backup. Keep it private.</p>
    </section>
  );
}
