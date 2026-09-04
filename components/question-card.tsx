"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Volume2 } from "@/components/icons";
import type { Expression, PracticeQuestion, ReviewRating } from "@/types/domain";

function normalize(value: string) { return value.toLowerCase().replace(/[^a-z0-9]/g, ""); }

export function QuestionCard({ question, expression, onRate }: { question: PracticeQuestion; expression: Expression; onRate: (rating: ReviewRating) => void }) {
  const [revealed, setRevealed] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [chosenIndexes, setChosenIndexes] = useState<number[]>([]);
  const [checked, setChecked] = useState<boolean | null>(null);
  const isRecall = question.type === "recall" || question.type === "variation";
  const isListening = question.type === "listening";
  const label = ({ recall: "Recall", cloze: "Complete the phrase", reorder: "Build the phrase", scenario: "Sounds most natural", variation: "Say it another way", listening: "Listening" } as const)[question.type];
  const tokens = useMemo(() => question.tokens ?? [], [question.tokens]);
  const built = useMemo(() => chosenIndexes.map((index) => tokens[index]).join(" "), [chosenIndexes, tokens]);
  const correctChoice = selected ? normalize(selected) === normalize(question.answer) : false;

  const speak = () => {
    if (!("speechSynthesis" in window)) return;
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(expression.text);
    utterance.lang = "en-US";
    utterance.rate = .88;
    speechSynthesis.speak(utterance);
  };

  useEffect(() => { if (isListening) speak(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const rateButtons: { value: ReviewRating; label: string }[] = [
    { value: "again", label: "Again" }, { value: "hard", label: "Hard" }, { value: "good", label: "Good" }, { value: "easy", label: "Easy" },
  ];

  return (
    <>
      <div className="question-wrap">
        <p className="question-label">{label}</p>
        <h1 className="question-prompt">{question.prompt}</h1>

        {isListening && <button className="secondary-button" style={{ marginTop: 24 }} onClick={speak}><Volume2 size={19} />Play again</button>}
        {(isRecall || isListening) && !revealed && <p className="think-note">{isListening ? "Listen before you read." : "Think first. Give your memory a moment."}</p>}

        {(isRecall || isListening) && revealed && <div className="answer-panel"><p className="answer-text">{question.answer}</p><p className="answer-meaning">{question.type === "variation" ? expression.variants[0]?.meaning : expression.meaning}</p>{question.explanation && <p className="answer-meaning">{question.explanation}</p>}</div>}

        {(question.type === "cloze" || question.type === "scenario") && <div className="option-list">{question.options?.map((option) => {
          const isAnswer = normalize(option) === normalize(question.answer);
          const className = !selected ? "option-button" : isAnswer ? "option-button correct" : selected === option ? "option-button wrong" : "option-button";
          return <button className={className} disabled={Boolean(selected)} key={option} onClick={() => setSelected(option)}>{option}</button>;
        })}</div>}

        {question.type === "reorder" && <>
          <button className="token-area" onClick={() => setChosenIndexes((items) => items.slice(0, -1))} aria-label="Remove last word">{chosenIndexes.length ? chosenIndexes.map((index, position) => <span className="token" key={`${index}-${position}`}>{tokens[index]}</span>) : <span style={{ color: "var(--muted)", margin: "auto" }}>Tap words in order</span>}</button>
          <div className="token-bank">{tokens.map((token, index) => <button className="token" disabled={chosenIndexes.includes(index) || checked !== null} key={`${token}-${index}`} onClick={() => setChosenIndexes((items) => [...items, index])}>{token}</button>)}</div>
          {checked !== null && <div className="answer-panel"><p className="answer-text">{question.answer}</p><p className="answer-meaning">{expression.meaning}</p></div>}
        </>}
      </div>

      <div className="session-actions">
        {(question.type === "cloze" || question.type === "scenario") && selected && <><p className={correctChoice ? "feedback correct" : "feedback wrong"}>{correctChoice ? "✓ Nice" : "Not quite — here’s the natural phrase"}</p><button className="primary-button" onClick={() => onRate(correctChoice ? "good" : "again")}>Continue</button></>}
        {question.type === "reorder" && checked === null && <button className="primary-button" disabled={!chosenIndexes.length} onClick={() => setChecked(normalize(built) === normalize(question.answer))}>Check answer</button>}
        {question.type === "reorder" && checked !== null && <><p className={checked ? "feedback correct" : "feedback wrong"}>{checked ? "✓ Nice" : "Not quite — check the word order"}</p><button className="primary-button" onClick={() => onRate(checked ? "good" : "again")}>Continue</button></>}
        {(isRecall || isListening) && !revealed && <button className="primary-button" onClick={() => setRevealed(true)}>{isListening ? "Show transcript" : "Show answer"}</button>}
        {isRecall && revealed && <div className="rating-row">{rateButtons.map((button) => <button className="rating-button" key={button.value} onClick={() => onRate(button.value)}>{button.label}</button>)}</div>}
        {isListening && revealed && <div className="rating-row" style={{ gridTemplateColumns: "1fr 1fr" }}><button className="rating-button" onClick={() => onRate("again")}>Again</button><button className="rating-button" onClick={() => onRate("good")}><Check size={15} /> Got it</button></div>}
      </div>
    </>
  );
}
