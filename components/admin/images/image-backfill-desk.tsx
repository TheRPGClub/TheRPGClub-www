"use client";

import { ImageDown } from "lucide-react";
import type { ImageBackfillRun } from "@/lib/api/types";
import { useImageBackfill } from "@/hooks/use-image-backfill";
import { EmptySheet, RunSheet } from "@/components/admin/images/run-sheet";
import { Button } from "@/components/ui/button";

// /admin/images: start the API's image download and follow it. While a run
// is queued or running the page re-reads it every few seconds and Start
// stays off; the API refuses a second run on its own too.
export function ImageBackfillDesk({
  initialRun,
  initialError,
}: {
  initialRun: ImageBackfillRun | null;
  initialError: string | null;
}) {
  const { run, error, pending, live, start } = useImageBackfill(initialRun, initialError);

  return (
    <div className="mt-6 grid items-start gap-9 lg:grid-cols-[minmax(0,1fr)_30rem]">
      <div className="min-w-0">
        <p className="max-w-[60ch] text-dim-foreground">
          The club&rsquo;s server looks up every GameDB game with no stored images on IGDB and saves
          its cover and art. Games with no IGDB id are skipped. It runs on the server, not the bot,
          so it carries on if you leave this page.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="highlight"
            onClick={start}
            disabled={pending || live}
            aria-describedby="backfill-start-note"
          >
            <ImageDown data-icon="inline-start" />
            {pending ? "Starting..." : "Download missing images"}
          </Button>
          <p id="backfill-start-note" className="text-[0.86rem] text-faint-foreground">
            {live
              ? "A download is running. Start comes back when it finishes."
              : "One download runs at a time."}
          </p>
        </div>
        {error && (
          <p role="alert" className="mt-3 text-sm text-destructive">
            {error}
          </p>
        )}
      </div>

      <figure className="relative">
        <div className="overflow-hidden rounded-md shadow-[0_24px_60px_rgb(0_0_0/0.55)]">
          {run ? <RunSheet run={run} /> : <EmptySheet />}
        </div>
      </figure>
    </div>
  );
}
