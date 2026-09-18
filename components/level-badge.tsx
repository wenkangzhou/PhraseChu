import type { Level } from "@/types/domain";

export function LevelBadge({ level }: { level: Level }) {
  return <span className={`level-badge level-${level.toLowerCase()}`}>{level}</span>;
}
