"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { Download, Upload } from "@/components/icons";
import { usePhraseChu } from "@/context/app-context";

type BackupStatus = { kind: "success" | "error"; message: string } | null;

function downloadFile(file: File) {
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function DataBackup() {
  const { createBackup, importBackup } = usePhraseChu();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<"export" | "import" | null>(null);
  const [status, setStatus] = useState<BackupStatus>(null);

  const exportBackup = async () => {
    setBusy("export");
    setStatus(null);
    try {
      const backup = await createBackup();
      const file = new File(
        [JSON.stringify(backup, null, 2)],
        `phrasechu-backup-${backup.exportedAt.slice(0, 10)}.json`,
        { type: "application/json" },
      );
      if (typeof navigator.share === "function" && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ title: "PhraseChu learning backup", files: [file] });
          setStatus({ kind: "success", message: "Backup shared successfully." });
          return;
        } catch (error) {
          if (error instanceof DOMException && error.name === "AbortError") return;
        }
      }
      downloadFile(file);
      setStatus({ kind: "success", message: "Backup downloaded." });
    } catch {
      setStatus({ kind: "error", message: "Could not create the backup. Please try again." });
    } finally {
      setBusy(null);
    }
  };

  const restoreBackup = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    setBusy("import");
    setStatus(null);
    try {
      if (file.size > 5_000_000) throw new Error("This backup file is too large.");
      const result = await importBackup(JSON.parse(await file.text()) as unknown);
      setStatus({
        kind: "success",
        message: `Merged ${result.progressCount} learned expressions, ${result.attemptCount} answers, and ${result.sessionCount} sessions.`,
      });
    } catch (error) {
      setStatus({
        kind: "error",
        message: error instanceof Error ? error.message : "Could not read this backup file.",
      });
    } finally {
      input.value = "";
      setBusy(null);
    }
  };

  return (
    <section className="settings-card">
      <h2>Backup &amp; transfer</h2>
      <p>Move progress between devices with one file. Importing merges both histories and keeps the stronger progress.</p>
      <div className="backup-actions">
        <button className="secondary-button" disabled={busy !== null} onClick={exportBackup}><Download size={17} />{busy === "export" ? "Preparing…" : "Export"}</button>
        <button className="secondary-button" disabled={busy !== null} onClick={() => inputRef.current?.click()}><Upload size={17} />{busy === "import" ? "Importing…" : "Import"}</button>
        <input ref={inputRef} className="backup-file-input" type="file" accept="application/json,.json" onChange={restoreBackup} />
      </div>
      {status && <p className={`backup-status ${status.kind}`} role="status">{status.message}</p>}
    </section>
  );
}
