import type { ImportSummary } from "@/lib/api/types";
import { importProgress, resultReasonLabel, resultReasonRows } from "@/lib/imports/kinds";

interface ImportProgressBarProps {
  total: number;
  counts: ImportSummary | null;
}

// Rows resolved out of the total, with a bar. Shared by every import kind.
export function ImportProgressBar({ total, counts }: ImportProgressBarProps) {
  const progress = importProgress(total, counts);
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-medium">
          {progress.resolved} of {progress.total} rows done
        </span>
        <span className="text-muted-foreground tabular-nums">{progress.percent}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={progress.total}
        aria-valuenow={progress.resolved}
        className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
      >
        <div
          className="h-full rounded-full bg-primary transition-[width]"
          style={{ width: `${progress.percent}%` }}
        />
      </div>
    </div>
  );
}

// How the resolved rows ended up, by result reason.
export function ImportOutcomeList({ counts }: { counts: ImportSummary | null }) {
  const rows = resultReasonRows(counts);
  if (rows.length === 0) return null;
  return (
    <ul className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
      {rows.map(([reason, n]) => (
        <li key={reason} className="flex justify-between gap-3">
          <span className="text-muted-foreground">{resultReasonLabel(reason)}</span>
          <span className="tabular-nums">{n}</span>
        </li>
      ))}
    </ul>
  );
}
