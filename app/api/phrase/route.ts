import { NextResponse } from "next/server";

interface KimiResponse { choices?: { message?: { content?: string } }[]; }

export async function POST(request: Request) {
  const { text } = await request.json() as { text?: string };
  if (!text?.trim()) return NextResponse.json({ error: "Enter a Chinese phrase first." }, { status: 400 });
  if (text.trim().length > 200) return NextResponse.json({ error: "Keep the phrase under 200 characters." }, { status: 400 });
  const apiKey = process.env.MOONSHOT_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Add MOONSHOT_API_KEY in Vercel to enable Kimi suggestions." }, { status: 503 });
  const baseUrl = (process.env.KIMI_BASE_URL || "https://api.moonshot.cn/v1").replace(/\/$/, "");
  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.KIMI_MODEL || "kimi-k2.6",
        temperature: 0.3,
        max_tokens: 250,
        messages: [
          { role: "system", content: "You help an adult B1/B2 Chinese learner say useful, natural American English. Return only compact JSON with string keys natural, casual, and note. Keep note under 20 Chinese characters. Never use markdown." },
          { role: "user", content: text.trim() },
        ],
      }),
    });
    if (!response.ok) throw new Error(`Kimi returned ${response.status}`);
    const data = await response.json() as KimiResponse;
    const content = data.choices?.[0]?.message?.content ?? "";
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Kimi returned an unexpected response");
    const result = JSON.parse(match[0]) as { natural?: string; casual?: string; note?: string };
    if (!result.natural || !result.casual) throw new Error("Kimi returned an incomplete response");
    return NextResponse.json({ natural: result.natural, casual: result.casual, note: result.note ?? "" });
  } catch (error) {
    console.error("Kimi phrase request failed", error);
    return NextResponse.json({ error: "Kimi couldn't answer just now. Try again shortly." }, { status: 502 });
  }
}
