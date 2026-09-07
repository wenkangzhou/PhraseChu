import { repository, type PhraseChuBackup } from "@/lib/repository";

const STORAGE_KEY = "phrasechu.cloud-sync.v1";
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 32;
const CODE_PATTERN = /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{32}$/;

export interface CloudSyncConfig {
  code: string;
  lastSyncedAt?: string;
}

interface PullResponse {
  backup: PhraseChuBackup | null;
  revision: number;
  updatedAt: string | null;
}

interface PushResponse extends PullResponse {
  applied: boolean;
}

export interface CloudSyncResult {
  code: string;
  lastSyncedAt: string;
  revision: number;
}

function canUseStorage() {
  return typeof window !== "undefined";
}

export function normalizeCloudSyncCode(value: string) {
  const compact = value.trim().toUpperCase().replace(/[\s-]/g, "");
  const body = compact.length === CODE_LENGTH + 2 && compact.startsWith("PC") ? compact.slice(2) : compact;
  if (!CODE_PATTERN.test(body)) {
    throw new Error("Enter a complete PhraseChu sync code.");
  }
  return `PC-${body.match(/.{1,4}/g)?.join("-")}`;
}

export function generateCloudSyncCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(CODE_LENGTH));
  let body = "";
  for (const byte of bytes) body += CODE_ALPHABET[byte & 31];
  return normalizeCloudSyncCode(body);
}

export function getCloudSyncConfig(): CloudSyncConfig | null {
  if (!canUseStorage()) return null;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "null") as Partial<CloudSyncConfig> | null;
    if (!parsed || typeof parsed.code !== "string") return null;
    return {
      code: normalizeCloudSyncCode(parsed.code),
      lastSyncedAt: typeof parsed.lastSyncedAt === "string" ? parsed.lastSyncedAt : undefined,
    };
  } catch {
    return null;
  }
}

export function clearCloudSyncConfig() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(STORAGE_KEY);
}

function saveCloudSyncConfig(config: CloudSyncConfig) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

async function hashSyncCode(code: string) {
  const bytes = new TextEncoder().encode(code);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function requestSync<T>(body: Record<string, unknown>): Promise<T> {
  const response = await fetch("/api/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const result = await response.json().catch(() => null) as { error?: string } | null;
  if (!response.ok) throw new Error(result?.error || "Cloud sync is unavailable. Try again shortly.");
  return result as T;
}

export async function syncCloudBackup(inputCode: string, requireExisting = false): Promise<CloudSyncResult> {
  const code = normalizeCloudSyncCode(inputCode);
  const syncHash = await hashSyncCode(code);

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const remote = await requestSync<PullResponse>({ action: "pull", syncHash });
    if (requireExisting && attempt === 0 && !remote.backup) {
      throw new Error("No cloud backup was found for this sync code.");
    }
    if (remote.backup) await repository.importBackup(remote.backup);

    const backup = await repository.createBackup();
    const pushed = await requestSync<PushResponse>({
      action: "push",
      syncHash,
      expectedRevision: remote.revision,
      backup,
    });
    if (pushed.applied) {
      const lastSyncedAt = pushed.updatedAt ?? new Date().toISOString();
      saveCloudSyncConfig({ code, lastSyncedAt });
      return { code, lastSyncedAt, revision: pushed.revision };
    }
    if (pushed.backup) await repository.importBackup(pushed.backup);
  }

  throw new Error("Your backup changed on another device. Please sync again.");
}
