import { NextResponse } from "next/server";
import { completeWithKimi, KimiRequestError, publicKimiError } from "@/lib/kimi";

export async function POST(request: Request) {
  let text: string | undefined;
  try {
    ({ text } = await request.json() as { text?: string });
  } catch {
    return NextResponse.json({ error: "The request must contain valid JSON." }, { status: 400 });
  }
  if (!text?.trim()) return NextResponse.json({ error: "Enter a Chinese phrase first." }, { status: 400 });
  if (text.trim().length > 200) return NextResponse.json({ error: "Keep the phrase under 200 characters." }, { status: 400 });
  try {
    const content = await completeWithKimi([
      { role: "system", content: "You help an adult B1/B2 Chinese learner say useful, natural American English. Return only compact JSON with string keys natural, casual, and note. Keep note under 20 Chinese characters. Never use markdown." },
      { role: "user", content: text.trim() },
    ], 800, request.signal);
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Kimi returned an unexpected response");
    const result = JSON.parse(match[0]) as { natural?: string; casual?: string; note?: string };
    if (!result.natural || !result.casual) throw new Error("Kimi returned an incomplete response");
    return NextResponse.json({ natural: result.natural, casual: result.casual, note: result.note ?? "" });
  } catch (error) {
    console.error("Kimi phrase request failed", error);
    const status = error instanceof KimiRequestError ? error.status === 503 ? 503 : 502 : 500;
    return NextResponse.json({ error: publicKimiError(error) }, { status });
  }
}
