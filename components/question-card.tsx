"use client";

import { PointerEvent, useEffect, useMemo, useRef, useState } from "react";
import { Check } from "@/components/icons";
import { SpeechButton } from "@/components/speech-button";
import { speakEnglish } from "@/lib/speech";
import type { Expression, PracticeQuestion, ReviewRating } from "@/types/domain";

function normalize(value: string) { return value.toLowerCase().replace(/[^a-z0-9]/g, ""); }

export function QuestionCard({ question, expression, onRate, onSkip }: { question: PracticeQuestion; expression: Expression; onRate: (rating: ReviewRating) => void; onSkip: () => void }) {
  const [revealed, setRevealed] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [chosenIndexes, setChosenIndexes] = useState<number[]>([]);
  const [checked, setChecked] = useState<boolean | null>(null);
  const [gaveUp, setGaveUp] = useState(false);
  const [draggingPosition, setDraggingPosition] = useState<number | null>(null);
  const draggingPositionRef = useRef<number | null>(null);
  const dragMovedRef = useRef(false);
  const isRecall = question.type === "recall" || question.type === "variation";
  const isListening = question.type === "listening";
  const label = ({ recall: "Recall", cloze: "Complete the phrase", reorder: "Build the phrase", scenario: "Sounds most natural", variation: "Say it another way", listening: "Listening" } as const)[question.type];
  const tokens = useMemo(() => question.tokens ?? [], [question.tokens]);
  const built = useMemo(() => chosenIndexes.map((index) => tokens[index]).join(" "), [chosenIndexes, tokens]);
  const correctChoice = selected ? normalize(selected) === normalize(question.answer) : false;

  const moveChosenToken = (from: number, to: number) => {
    if (from === to) return;
    setChosenIndexes((items) => {
      const next = [...items];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const startDragging = (event: PointerEvent<HTMLButtonElement>, position: number) => {
    if (checked !== null) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    draggingPositionRef.current = position;
    dragMovedRef.current = false;
    setDraggingPosition(position);
  };

  const dragToken = (event: PointerEvent<HTMLButtonElement>) => {
    const from = draggingPositionRef.current;
    if (from === null) return;
    const target = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>("[data-token-position]");
    const to = Number(target?.dataset.tokenPosition);
    if (!Number.isInteger(to) || from === to) return;
    moveChosenToken(from, to);
    draggingPositionRef.current = to;
    dragMovedRef.current = true;
    setDraggingPosition(to);
  };

  const stopDragging = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    draggingPositionRef.current = null;
    setDraggingPosition(null);
    window.setTimeout(() => { dragMovedRef.current = false; }, 0);
  };

  const removeChosenToken = (position: number) => {
    if (dragMovedRef.current || checked !== null) return;
    setChosenIndexes((items) => items.filter((_, index) => index !== position));
  };

  const giveUp = () => {
    setGaveUp(true);
    if (isRecall || isListening) setRevealed(true);
    if (question.type === "cloze" || question.type === "scenario") setSelected("__gave_up__");
    if (question.type === "reorder") setChecked(false);
  };

  useEffect(() => {
    if (isListening) speakEnglish(expression.text, { rate: .88 });
  }, [expression.text, isListening]);

  const rateButtons: { value: ReviewRating; label: string }[] = [
    { value: "again", label: "Again" }, { value: "hard", label: "Hard" }, { value: "good", label: "Good" }, { value: "easy", label: "Easy" },
  ];

  return (
    <>
      <div className="question-wrap">
        <p className="question-label">{label}</p>
        <h1 className="question-prompt">{question.prompt}</h1>

        {isListening && <SpeechButton text={expression.text} label="Play again" rate={.88} className="secondary-button listening-play-button" />}
        {(isRecall || isListening) && !revealed && <p className="think-note">{isListening ? "Listen before you read." : "Think first. Give your memory a moment."}</p>}

        {(isRecall || isListening) && revealed && <div className="answer-panel"><p className="answer-text">{question.answer}</p><p className="answer-meaning">{question.type === "variation" ? expression.variants[0]?.meaning : expression.meaning}</p>{question.explanation && <p className="answer-meaning">{question.explanation}</p>}</div>}

        {(question.type === "cloze" || question.type === "scenario") && <div className="option-list">{question.options?.map((option) => {
          const isAnswer = normalize(option) === normalize(question.answer);
          const className = !selected ? "option-button" : isAnswer ? "option-button correct" : selected === option ? "option-button wrong" : "option-button";
          return <button className={className} disabled={Boolean(selected)} key={option} onClick={() => setSelected(option)}>{option}</button>;
        })}</div>}

        {question.type === "reorder" && <>
          <div className="token-area" aria-label="Your answer">{chosenIndexes.length ? chosenIndexes.map((index, position) => <button type="button" className={draggingPosition === position ? "token chosen-token dragging" : "token chosen-token"} data-token-position={position} key={index} onPointerDown={(event) => startDragging(event, position)} onPointerMove={dragToken} onPointerUp={stopDragging} onPointerCancel={stopDragging} onClick={() => removeChosenToken(position)} onKeyDown={(event) => { if (event.key === "ArrowLeft" && position > 0) { event.preventDefault(); moveChosenToken(position, position - 1); } if (event.key === "ArrowRight" && position < chosenIndexes.length - 1) { event.preventDefault(); moveChosenToken(position, position + 1); } }}>{tokens[index]}</button>) : <span style={{ color: "var(--muted)", margin: "auto" }}>Tap words in order</span>}</div>
          {chosenIndexes.length > 1 && checked === null && <p className="token-help">Drag to rearrange · tap a word to remove it</p>}
          <div className="token-bank">{tokens.map((token, index) => <button className="token" disabled={chosenIndexes.includes(index) || checked !== null} key={`${token}-${index}`} onClick={() => setChosenIndexes((items) => [...items, index])}>{token}</button>)}</div>
          {checked !== null && <div className="answer-panel"><p className="answer-text">{question.answer}</p><p className="answer-meaning">{expression.meaning}</p></div>}
        </>}
      </div>

      <div className="session-actions">
        {(question.type === "cloze" || question.type === "scenario") && selected && <><p className={correctChoice ? "feedback correct" : "feedback wrong"}>{correctChoice ? "✓ Nice" : gaveUp ? "No problem — review the answer once" : "Not quite — here’s the natural phrase"}</p><button className="primary-button" onClick={() => onRate(correctChoice ? "good" : "again")}>Continue</button></>}
        {question.type === "reorder" && checked === null && <button className="primary-button" disabled={!chosenIndexes.length} onClick={() => setChecked(normalize(built) === normalize(question.answer))}>Check answer</button>}
        {question.type === "reorder" && checked !== null && <><p className={checked ? "feedback correct" : "feedback wrong"}>{checked ? "✓ Nice" : gaveUp ? "No problem — review the word order once" : "Not quite — check the word order"}</p><button className="primary-button" onClick={() => onRate(checked ? "good" : "again")}>Continue</button></>}
        {(isRecall || isListening) && !revealed && <button className="primary-button" onClick={() => setRevealed(true)}>{isListening ? "Show transcript" : "Show answer"}</button>}
        {isRecall && revealed && (gaveUp ? <><p className="feedback wrong">No problem — review it once</p><button className="primary-button" onClick={() => onRate("again")}>Continue</button></> : <div className="rating-row">{rateButtons.map((button) => <button className="rating-button" key={button.value} onClick={() => onRate(button.value)}>{button.label}</button>)}</div>)}
        {isListening && revealed && (gaveUp ? <><p className="feedback wrong">Listen once more, then keep going</p><button className="primary-button" onClick={() => onRate("again")}>Continue</button></> : <div className="rating-row" style={{ gridTemplateColumns: "1fr 1fr" }}><button className="rating-button" onClick={() => onRate("again")}>Again</button><button className="rating-button" onClick={() => onRate("good")}><Check size={15} /> Got it</button></div>)}
        {((isRecall || isListening) && !revealed || (question.type === "cloze" || question.type === "scenario") && !selected || question.type === "reorder" && checked === null) && <div className="session-secondary-actions"><button className="text-button" onClick={giveUp}>I don&apos;t know yet</button>{isListening && <button className="text-button" onClick={onSkip}>Skip listening</button>}</div>}
      </div>
    </>
  );
}
