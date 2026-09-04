import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="complete">
      <h1>That phrase slipped away.</h1>
      <p>The page you opened doesn&apos;t exist.</p>
      <Link className="primary-button" href="/">Back to Today</Link>
    </div>
  );
}
