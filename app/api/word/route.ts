import { NextResponse } from "next/server";
import { completeWithKimi, KimiRequestError, publicKimiError } from "@/lib/kimi";

interface WordResult {
  word?: string;
  ipa?: string;
  partOfSpeech?: string;
  meaning?: string;
  example?: string;
}

export async function POST(request: Request) {
  let word: string | undefined;
  try {
    ({ word } = await request.json() as { word?: string });
  } catch {
    return NextResponse.json({ error: "The request must contain valid JSON." }, { status: 400 });
  }
  const normalized = word?.trim();
  if (!normalized || !/^[A-Za-z]+(?:['’-][A-Za-z]+)*$/u.test(normalized)) {
    return NextResponse.json({ error: "Enter one English word." }, { status: 400 });
  }
  if (normalized.length > 50) return NextResponse.json({ error: "Keep the word under 50 characters." }, { status: 400 });

  try {
    const content = await completeWithKimi([
      { role: "system", content: "You are a concise American English dictionary for a Chinese B1/B2 learner. Return only one compact JSON object with string keys word, ipa, partOfSpeech, meaning, and example. Use General American IPA wrapped in slashes, a short Chinese meaning, and one natural short English example. Never use markdown." },
      { role: "user", content: normalized },
    ], 400, request.signal);
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) throw new SyntaxError("Kimi returned an unexpected word response");
    const result = JSON.parse(match[0]) as WordResult;
    if (!result.ipa || !result.meaning) throw new SyntaxError("Kimi returned an incomplete word response");
    return NextResponse.json({
      word: result.word || normalized,
      ipa: result.ipa,
      partOfSpeech: result.partOfSpeech || "word",
      meaning: result.meaning,
      example: result.example || "",
    });
  } catch (error) {
    console.error("Kimi word request failed", error);
    const status = error instanceof KimiRequestError ? error.status === 503 ? 503 : 502 : 500;
    return NextResponse.json({ error: publicKimiError(error) }, { status });
  }
}
