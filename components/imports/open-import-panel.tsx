import { ArrowRight } from "lucide-react";
import type { ImportJob, ImportSummary } from "@/lib/api/types";
import {
  IMPORT_KINDS,
  IMPORT_STATUS_LABELS,
  importProgress,
  importStartedDate,
  resultReasonLabel,
  resultReasonRows,
  type ImportKind,
} from "@/lib/imports/kinds";
import { ButtonLink } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

// An open import on the hub, as a yellow progress panel: it's the member's
// unfinished business, so it leads the page.
export function OpenImportPanel({
  kind,
  job,
  counts,
  href,
}: {
  kind: ImportKind;
  job: ImportJob;
  counts: ImportSummary | null;
  href: string;
}) {
  const progress = importProgress(job.total_count, counts);
  const outcomes = resultReasonRows(counts).slice(0, 3);
  const status = IMPORT_STATUS_LABELS[job.status] ?? job.status;
  const noun = IMPORT_KINDS[kind].itemNoun.other;

  return (
    <section
      aria-label={`Open import: ${IMPORT_KINDS[kind].label}`}
      className="grid gap-4 rounded-md bg-highlight px-5 py-5 text-highlight-foreground sm:grid-cols-[auto_1fr] sm:items-center sm:gap-7 sm:px-6.5 sm:py-6 lg:grid-cols-[auto_1fr_auto]"
    >
      <p className="font-headline text-[5rem] leading-[0.78] sm:text-[6.75rem]">
        {progress.percent}
        <span className="text-[2.5rem]">%</span>
      </p>
      <div className="min-w-0">
        <h2 className="font-headline text-[1.9rem] leading-[0.95] sm:text-[2.25rem]">
          {IMPORT_KINDS[kind].label}, {status.toLowerCase()}
        </h2>
        <p className="mt-1.5 font-medium text-highlight-muted-foreground">
          {progress.resolved} of {progress.total} {noun} done. Started{" "}
          {importStartedDate(job.created_at)}.
        </p>
        <Progress
          aria-label="Import progress"
          value={progress.resolved}
          max={progress.total}
          tone="inverse"
          size="lg"
          className="mt-3.5"
        />
        {outcomes.length > 0 && (
          <ul className="font-label mt-3 flex flex-wrap gap-x-5.5 gap-y-1.5 text-[0.82rem] font-extrabold tracking-[0.06em]">
            {outcomes.map(([reason, n]) => (
              <li key={reason}>
                <b className="font-headline mr-1.5 text-[1.4rem] font-normal tracking-normal">
                  {n}
                </b>
                {resultReasonLabel(reason)}
              </li>
            ))}
          </ul>
        )}
      </div>
      <ButtonLink
        href={href}
        size="lg"
        variant="inverse"
        className="justify-self-start sm:col-span-2 lg:col-span-1"
      >
        {job.status === "paused" ? "Resume" : "Continue"}
        <ArrowRight data-icon="inline-end" />
      </ButtonLink>
    </section>
  );
}
