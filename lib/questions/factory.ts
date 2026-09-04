import { expressions } from "@/lib/data/expressions";
import type { Expression, PracticeQuestion, QuestionType } from "@/types/domain";

const cycle: QuestionType[] = ["recall", "cloze", "recall", "reorder", "scenario", "variation"];

function cleanTokens(text: string) {
  return text.match(/[A-Za-z]+(?:'[A-Za-z]+)?|\d+|[^\sA-Za-z\d]/g) ?? [text];
}

function shuffled<T>(items: T[], seed: string): T[] {
  return [...items].sort((a, b) => {
    const av = `${seed}${String(a)}`.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) % 17;
    const bv = `${seed}${String(b)}`.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) % 17;
    return av - bv;
  });
}

function makeCloze(expression: Expression) {
  const words = expression.text.match(/[A-Za-z]+(?:'[A-Za-z]+)?/g) ?? [];
  const target = [...words].sort((a, b) => b.length - a.length)[0] ?? words[0] ?? expression.text;
  const distractors = ["really", "already", "still", "about", "just", "there"].filter(
    (word) => word.toLowerCase() !== target.toLowerCase(),
  );
  return {
    prompt: expression.text.replace(target, "____"),
    answer: target,
    options: shuffled([target, ...distractors.slice(0, 2)], expression.id),
  };
}

export function questionFor(expression: Expression, index: number, forcedType?: QuestionType): PracticeQuestion {
  const type = forcedType ?? cycle[index % cycle.length];
  const base = {
    id: `${type}:${expression.id}`,
    expressionId: expression.id,
    type,
    answer: expression.text,
    explanation: expression.notes ?? expression.variants[0]?.meaning ?? expression.meaning,
  };

  if (type === "cloze") return { ...base, ...makeCloze(expression) };
  if (type === "reorder") {
    const answerTokens = cleanTokens(expression.text);
    return { ...base, prompt: expression.meaning, tokens: shuffled(answerTokens, expression.id) };
  }
  if (type === "scenario") {
    const distractors = expressions
      .filter((item) => item.scenarioId === expression.scenarioId && item.id !== expression.id)
      .slice(0, 2)
      .map((item) => item.text);
    return { ...base, prompt: expression.meaning, options: shuffled([expression.text, ...distractors], expression.id) };
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

export function parseQuestionId(id: string): PracticeQuestion | null {
  const [type, ...rest] = id.split(":");
  const expression = expressions.find((item) => item.id === rest.join(":"));
  return expression ? questionFor(expression, 0, type as QuestionType) : null;
}
