import { NextResponse } from "next/server";

const MAX_BACKUP_BYTES = 3_500_000;
const syncHashPattern = /^[a-f0-9]{64}$/;

interface SupabaseBackup {
  payload: unknown;
  revision: number;
  updatedAt: string;
}

interface SupabasePushResult extends SupabaseBackup {
  applied: boolean;
}

function isBackup(value: unknown): value is Record<string, unknown> {
  return typeof value === "object"
    && value !== null
    && !Array.isArray(value)
    && "format" in value && value.format === "phrasechu-backup"
    && "version" in value && value.version === 1
    && "data" in value && typeof value.data === "object" && value.data !== null;
}

class SupabaseSyncError extends Error {
  constructor(public readonly status: number, public readonly code?: string) {
    super("Supabase sync request failed");
  }
}

function supabaseConfig() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  return { url, key };
}

async function callRpc<T>(name: string, parameters: Record<string, unknown>, signal: AbortSignal): Promise<T> {
  const config = supabaseConfig();
  if (!config) throw new Error("SUPABASE_NOT_CONFIGURED");
  const response = await fetch(`${config.url}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: {
      apikey: config.key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(parameters),
    cache: "no-store",
    signal,
  });
  if (!response.ok) {
    const detail = await response.json().catch(() => null) as { code?: string } | null;
    throw new SupabaseSyncError(response.status, detail?.code);
  }
  return response.json() as Promise<T>;
}

function publicError(error: unknown) {
  if (error instanceof Error && error.message === "SUPABASE_NOT_CONFIGURED") {
    return { message: "Cloud sync is not configured on this deployment.", status: 503 };
  }
  if (error instanceof SupabaseSyncError && (error.status === 404 || error.code === "PGRST202")) {
    return { message: "Cloud sync database setup is incomplete. Run the PhraseChu Supabase SQL first.", status: 503 };
  }
  if (error instanceof TypeError && error.message === "fetch failed") {
    return { message: "Could not reach Supabase. Check the SUPABASE_URL setting.", status: 502 };
  }
  return { message: "Cloud sync is unavailable. Try again shortly.", status: 502 };
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BACKUP_BYTES) {
    return NextResponse.json({ error: "This learning backup is too large to sync." }, { status: 413 });
  }

  let body: { action?: unknown; syncHash?: unknown; expectedRevision?: unknown; backup?: unknown };
  try {
    body = await request.json() as typeof body;
  } catch {
    return NextResponse.json({ error: "The request must contain valid JSON." }, { status: 400 });
  }

  if (typeof body.syncHash !== "string" || !syncHashPattern.test(body.syncHash)) {
    return NextResponse.json({ error: "The sync code is invalid." }, { status: 400 });
  }

  try {
    if (body.action === "pull") {
      const remote = await callRpc<SupabaseBackup | null>(
        "get_phrasechu_backup",
        { p_sync_hash: body.syncHash },
        request.signal,
      );
      return NextResponse.json({
        backup: remote?.payload ?? null,
        revision: remote?.revision ?? 0,
        updatedAt: remote?.updatedAt ?? null,
      });
    }

    if (body.action === "push") {
      if (!Number.isSafeInteger(body.expectedRevision) || Number(body.expectedRevision) < 0) {
        return NextResponse.json({ error: "The backup revision is invalid." }, { status: 400 });
      }
      if (!isBackup(body.backup)) {
        return NextResponse.json({ error: "The learning backup is invalid." }, { status: 400 });
      }
      const serialized = JSON.stringify(body.backup);
      if (!serialized || serialized.length > MAX_BACKUP_BYTES) {
        return NextResponse.json({ error: "This learning backup is too large to sync." }, { status: 413 });
      }
      const remote = await callRpc<SupabasePushResult>(
        "put_phrasechu_backup",
        {
          p_sync_hash: body.syncHash,
          p_expected_revision: body.expectedRevision,
          p_payload: body.backup,
        },
        request.signal,
      );
      return NextResponse.json({
        applied: remote.applied,
        backup: remote.payload ?? null,
        revision: remote.revision,
        updatedAt: remote.updatedAt,
      });
    }

    return NextResponse.json({ error: "The sync action is invalid." }, { status: 400 });
  } catch (error) {
    console.error("PhraseChu cloud sync failed", error instanceof SupabaseSyncError ? { status: error.status, code: error.code } : error);
    const response = publicError(error);
    return NextResponse.json({ error: response.message }, { status: response.status });
  }
}
