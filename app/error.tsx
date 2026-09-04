"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="complete">
      <h1>Something got tangled.</h1>
      <p>Your saved learning progress is still on this device.</p>
      <button className="primary-button" onClick={reset}>Try again</button>
    </div>
  );
}
