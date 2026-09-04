import Image from "next/image";
import Link from "next/link";

export function AppHeader({ action }: { action?: React.ReactNode }) {
  return (
    <header className="app-header">
      <Link href="/" className="brand" aria-label="PhraseChu home">
        <span className="brand-mark">
          <Image src="/phrasechu-logo.png" alt="" width={44} height={44} priority />
        </span>
        <span>Phrase<span>Chu</span></span>
      </Link>
      {action}
    </header>
  );
}
