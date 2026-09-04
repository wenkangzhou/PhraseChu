import "server-only";

interface KimiResponse {
  choices?: { message?: { content?: string } }[];
  error?: { code?: string; message?: string; type?: string };
}

export interface KimiMessage {
  role: "system" | "user";
  content: string;
}

export class KimiRequestError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "KimiRequestError";
  }
}

export async function completeWithKimi(messages: KimiMessage[], maxTokens: number, signal?: AbortSignal) {
  const apiKey = process.env.MOONSHOT_API_KEY;
  if (!apiKey) throw new KimiRequestError(503, "MOONSHOT_API_KEY is missing");
  const baseUrl = (process.env.KIMI_BASE_URL || "https://api.moonshot.cn/v1").replace(/\/$/, "");
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.KIMI_MODEL || "kimi-k2.6",
      thinking: { type: "disabled" },
      max_tokens: maxTokens,
      messages,
    }),
    signal,
  });
  const raw = await response.text();
  let data: KimiResponse = {};
  try {
    data = JSON.parse(raw) as KimiResponse;
  } catch {
    if (response.ok) throw new SyntaxError("Kimi returned invalid JSON");
  }
  if (!response.ok) {
    const detail = data.error?.message || data.error?.code || data.error?.type || raw.slice(0, 200) || `HTTP ${response.status}`;
    throw new KimiRequestError(response.status, detail);
  }
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Kimi returned an empty response");
  return content;
}

export function publicKimiError(error: unknown) {
  if (error instanceof KimiRequestError) {
    if (error.status === 503 && /MOONSHOT_API_KEY/u.test(error.message)) return "Add MOONSHOT_API_KEY in Vercel to enable Kimi suggestions.";
    if (error.status === 401 || error.status === 403) return "Kimi authentication failed. Check MOONSHOT_API_KEY in Vercel.";
    if (error.status === 429) return "Kimi is rate limited or the account has no remaining balance. Try again shortly.";
    if (error.status >= 500) return "Kimi is temporarily unavailable. Try again shortly.";
    return "Kimi rejected the request. Check KIMI_MODEL and the server logs.";
  }
  if (error instanceof SyntaxError) return "Kimi returned a response PhraseChu couldn't read. Try again.";
  return "Kimi couldn't answer just now. Try again shortly.";
}
