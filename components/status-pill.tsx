import type { ExpressionStatus } from "@/types/domain";

export function StatusPill({ status }: { status: ExpressionStatus }) {
  return <span className={`status-pill status-${status}`}>{status[0].toUpperCase() + status.slice(1)}</span>;
}
