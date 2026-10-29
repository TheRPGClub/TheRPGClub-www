import type { ImportSummary } from "@/lib/api/types";
import {
  IMPORT_KINDS,
  importProgress,
  resultReasonLabel,
  resultReasonRows,
  type ImportKind,
} from "@/lib/imports/kinds";

interface ImportProgressBarProps {
  kind: ImportKind;
  total: number;
  counts: ImportSummary | null;
}

// Items resolved out of the total: a monumental count over a yellow bar.
// Shared by every import kind.
export function ImportProgressBar({ kind, total, counts }: ImportProgressBarProps) {
  const progress = importProgress(total, counts);
  return (
    <div className="min-w-0">
      <p className="font-headline text-[3.4rem] leading-[0.8] sm:text-[5.25rem]">
        {progress.resolved}
        <span className="font-label mt-2 block text-[0.88rem] leading-tight font-extrabold tracking-[0.08em] text-paper-mute">
          of {progress.total} {IMPORT_KINDS[kind].itemNoun.other} done
        </span>
      </p>
      <div
        role="progressbar"
        aria-label="Import progress"
        aria-valuemin={0}
        aria-valuemax={progress.total}
        aria-valuenow={progress.resolved}
        aria-valuetext={`${progress.percent}%`}
        className="mt-3.5 h-2 w-full overflow-hidden bg-ink-3"
      >
        <div
          className="h-full bg-highlight transition-[width] duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
          style={{ width: `${progress.percent}%` }}
        />
      </div>
    </div>
  );
}

// How the resolved rows ended up, by result reason, with what's still to
// review leading in yellow while the import is open.
export function ImportOutcomeList({
  counts,
  pending,
}: {
  counts: ImportSummary | null;
  // Rows still waiting; omitted once the import is over.
  pending?: number;
}) {
  const rows = resultReasonRows(counts);
  if (rows.length === 0 && !pending) return null;
  return (
    <ul className="border-t-2 border-paper">
      {pending !== undefined && pending > 0 && (
        <OutcomeRow label="Still to review" n={pending} lead />
      )}
      {rows.map(([reason, n]) => (
        <OutcomeRow key={reason} label={resultReasonLabel(reason)} n={n} />
      ))}
    </ul>
  );
}

function OutcomeRow({ label, n, lead }: { label: string; n: number; lead?: boolean }) {
  return (
    <li className="flex items-baseline justify-between gap-3 border-b border-rule py-2.5 text-sm text-paper-dim">
      <span>{label}</span>
      <b
        className={
          lead
            ? "font-headline text-xl font-normal text-highlight"
            : "font-headline text-xl font-normal text-paper"
        }
      >
        {n}
      </b>
    </li>
  );
}

// The pending count, for the tally's lead row.
export function importPending(total: number, counts: ImportSummary | null): number {
  return importProgress(total, counts).pending;
}
