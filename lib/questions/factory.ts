import type { Expression, PracticeQuestion, QuestionType } from "@/types/domain";
import { shuffledWithSeed } from "@/lib/random";

const cycle: QuestionType[] = ["recall", "cloze", "recall", "reorder", "scenario", "variation"];

function cleanTokens(text: string) {
  return text.match(/[A-Za-z]+(?:'[A-Za-z]+)?|\d+|[^\sA-Za-z\d]/g) ?? [text];
}

function shuffledTokens(items: string[], seed: string): string[] {
  const shuffled = shuffledWithSeed(items, seed);
  if (items.length > 1 && shuffled.every((item, index) => item === items[index])) {
    return [...shuffled.slice(1), shuffled[0]];
  }
  return shuffled;
}

function makeCloze(expression: Expression, seed: string) {
  const words = expression.text.match(/[A-Za-z]+(?:'[A-Za-z]+)?/g) ?? [];
  const stopWords = new Set(["a", "an", "the", "i", "you", "we", "they", "he", "she", "it"]);
  const candidates = words.filter((word) => !stopWords.has(word.toLowerCase()));
  const target = shuffledWithSeed(candidates.length ? candidates : words, `${seed}:cloze`)[0] ?? expression.text;
  const distractors = ["really", "already", "still", "about", "just", "there"].filter(
    (word) => word.toLowerCase() !== target.toLowerCase(),
  );
  return {
    prompt: expression.text.replace(target, "____"),
    answer: target,
    options: shuffledWithSeed([target, ...shuffledWithSeed(distractors, `${seed}:distractors`).slice(0, 2)], `${seed}:options`),
  };
}

export function questionFor(expression: Expression, index: number, forcedType?: QuestionType, expressions: Expression[] = [], seed = expression.id): PracticeQuestion {
  const type = forcedType ?? cycle[index % cycle.length];
  const base = {
    id: `q2|${type}|${encodeURIComponent(expression.id)}|${seed}`,
    expressionId: expression.id,
    type,
    answer: expression.text,
    explanation: expression.notes ?? expression.variants[0]?.meaning ?? expression.meaning,
  };

  if (type === "cloze") return { ...base, ...makeCloze(expression, seed) };
  if (type === "reorder") {
    const answerTokens = cleanTokens(expression.text);
    return { ...base, prompt: expression.meaning, tokens: shuffledTokens(answerTokens, `${seed}:tokens`) };
  }
  if (type === "scenario") {
    const scenarioPeers = expressions.filter((item) => item.scenarioId === expression.scenarioId && item.id !== expression.id);
    const fallbackPeers = expressions.filter((item) => item.id !== expression.id && !scenarioPeers.some((peer) => peer.id === item.id));
    const distractors = [
      ...shuffledWithSeed(scenarioPeers, `${seed}:scenario-peers`),
      ...shuffledWithSeed(fallbackPeers, `${seed}:fallback-peers`),
    ]
      .slice(0, 2)
      .map((item) => item.text);
    return { ...base, prompt: expression.meaning, options: shuffledWithSeed([expression.text, ...distractors], `${seed}:options`) };
  }
  if (type === "variation" && expression.variants[0]) {
    return {
      ...base,
      prompt: expression.variants[0].meaning,
      answer: expression.variants[0].text,
      explanation: `A natural variation of “${expression.text}”`,
    };
  }
  if (type === "listening") return { ...base, prompt: "Listen first. What did you hear?" };
  return { ...base, prompt: expression.meaning };
}

export function parseQuestionId(id: string, expressions: Expression[]): PracticeQuestion | null {
  if (id.startsWith("q2|")) {
    const [, type, encodedExpressionId, seed] = id.split("|");
    if (!type || !encodedExpressionId || !seed) return null;
    const expressionId = decodeURIComponent(encodedExpressionId);
    const expression = expressions.find((item) => item.id === expressionId);
    return expression ? { ...questionFor(expression, 0, type as QuestionType, expressions, seed), id } : null;
  }
  const [type, ...rest] = id.split(":");
  const expression = expressions.find((item) => item.id === rest.join(":"));
  return expression ? questionFor(expression, 0, type as QuestionType, expressions) : null;
}
