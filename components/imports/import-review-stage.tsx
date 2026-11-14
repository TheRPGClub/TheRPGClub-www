"use client";

import { useRouter } from "next/navigation";
import { Loader2, RotateCcw } from "lucide-react";
import type { ImportJob, ImportReview } from "@/lib/api/types";
import { IMPORT_KINDS, type ImportKind } from "@/lib/imports/kinds";
import { ImportItemPanel, type ImportPerform } from "@/components/imports/import-item-panel";
import { Button, ButtonLink } from "@/components/ui/button";

// The review's main column: the last error, then the row under review, the
// working line while nothing needs the member, or how the import stands
// (paused, finished, canceled).
export function ImportReviewStage({
  kind,
  userId,
  job,
  review,
  busy,
  error,
  perform,
}: {
  kind: ImportKind;
  userId: string;
  job: ImportJob;
  review: ImportReview | null;
  busy: string | null;
  error: string | null;
  perform: ImportPerform;
}) {
  const item = review?.item ?? null;
  const finished = job.status === "completed" || job.status === "canceled";

  return (
    <div className="min-w-0 space-y-4">
      {error && (
        <p
          role="alert"
          className="rounded-sm border border-destructive/40 bg-destructive/8 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </p>
      )}

      {job.status === "active" && item && review && (
        <ImportItemPanel
          key={item.item_id}
          kind={kind}
          userId={userId}
          review={{ ...review, item }}
          disabled={!!busy}
          perform={perform}
        />
      )}

      {job.status === "active" && !item && busy && (
        <div className="grid min-h-60 place-items-center rounded-md border border-dashed border-border-strong px-6 text-center">
          <p className="font-label inline-flex items-center gap-2 text-[0.95rem] font-extrabold tracking-[0.06em] text-dim-foreground">
            <Loader2 aria-hidden className="size-4 animate-spin" />
            {busy}
          </p>
        </div>
      )}

      {job.status === "paused" && (
        <div className="rounded-md border border-dashed border-border-strong px-6 py-12 text-center">
          <h2 className="font-headline text-4xl">Paused</h2>
          <p className="mx-auto mt-2 max-w-[48ch] text-sm text-dim-foreground">
            Resume it whenever you like; it picks up at the next{" "}
            {IMPORT_KINDS[kind].itemNoun.one}.
          </p>
        </div>
      )}

      {finished && <ImportFinished kind={kind} userId={userId} completed={job.status === "completed"} />}
    </div>
  );
}

function ImportFinished({
  kind,
  userId,
  completed,
}: {
  kind: ImportKind;
  userId: string;
  completed: boolean;
}) {
  const router = useRouter();
  const resultsPath = IMPORT_KINDS[kind].affects[0];
  return (
    <section className="space-y-4 rounded-md border border-border bg-card p-5 sm:p-6">
      <h2 className="font-headline text-[2.6rem] leading-[0.9]">
        {completed ? "Import finished" : "Import canceled"}
      </h2>
      <p className="text-sm text-dim-foreground">
        {completed
          ? "Everything in the file has been dealt with. The tally on the left is how it went."
          : "The import stopped. Anything added before you canceled stays in your list."}
      </p>
      <div className="flex flex-wrap gap-2">
        {resultsPath && (
          <ButtonLink href={`/members/${userId}/${resultsPath}`} variant="highlight">
            See your list
          </ButtonLink>
        )}
        <Button type="button" variant="outline" onClick={() => router.refresh()}>
          <RotateCcw data-icon="inline-start" /> Start another import
        </Button>
      </div>
    </section>
  );
}
