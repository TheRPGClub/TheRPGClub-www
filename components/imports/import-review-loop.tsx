"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Ban, Loader2, Pause, Play, RotateCcw } from "lucide-react";
import {
  advanceImportAction,
  loadImportAction,
  setImportStatusAction,
  type ImportActionResult,
} from "@/app/actions/imports";
import type { ImportJob, ImportReview, ImportStatus, ImportSummary } from "@/lib/api/types";
import {
  IMPORT_KINDS,
  IMPORT_STATUS_LABELS,
  shouldAdvanceAgain,
  type ImportKind,
} from "@/lib/imports/kinds";
import { ImportItemPanel, type ImportPerform } from "@/components/imports/import-item-panel";
import {
  ImportOutcomeList,
  ImportProgressBar,
  importPending,
} from "@/components/imports/import-progress";
import { Chip } from "@/components/issue/chip";
import { Button, buttonVariants } from "@/components/ui/button";

// Safety net for the "call advance again" loop: each call resolves up to 25
// rows, so this covers 5,000 automatic rows before asking the member to go on.
const MAX_ADVANCE_ROUNDS = 200;
const advancingLabel = (kind: ImportKind) =>
  `Working through your ${IMPORT_KINDS[kind].itemNoun.other}…`;

interface ImportReviewLoopProps {
  kind: ImportKind;
  userId: string;
  initialImport: ImportJob;
  initialCounts: ImportSummary | null;
}

// Drives an import from the browser, for any import kind: calls `advance`
// until a row needs the member (or the import finishes), shows that row's
// review panel, and offers pause, resume and cancel. Each item action goes
// through `perform`, which advances again once it succeeds.
export function ImportReviewLoop({
  kind,
  userId,
  initialImport,
  initialCounts,
}: ImportReviewLoopProps) {
  const router = useRouter();
  const [job, setJob] = useState<ImportJob>(initialImport);
  const [review, setReview] = useState<ImportReview | null>(null);
  const [counts, setCounts] = useState<ImportSummary | null>(initialCounts);
  const [busy, setBusy] = useState<string | null>(
    initialImport.status === "active" ? advancingLabel(kind) : null,
  );
  const [error, setError] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  // Set by pause/cancel so an advance loop in flight stops at its next turn
  // and doesn't overwrite the new status with its stale copy.
  const stopRef = useRef(false);
  const startedRef = useRef(false);

  const importId = job.import_id;

  const showReview = useCallback((next: ImportReview) => {
    setReview(next);
    setJob(next.import);
    setCounts(next.counts);
  }, []);

  // Re-read the import after a 409, so the UI shows its real status.
  const resync = useCallback(async () => {
    const res = await loadImportAction(kind, userId, importId);
    if (res.ok && res.data) setJob(res.data);
    setReview(null);
  }, [kind, userId, importId]);

  // The "call advance until a row needs the member" loop. It sets no state
  // before its first await, so the mount effect can start it directly.
  const advanceLoop = useCallback(async () => {
    try {
      for (let round = 0; round < MAX_ADVANCE_ROUNDS; round++) {
        const res = await advanceImportAction(kind, userId, importId);
        if (stopRef.current) return;
        if (!res.ok || !res.data) {
          setError(res.error ?? "Couldn't continue the import.");
          if (res.code === "import_not_active") await resync();
          return;
        }
        showReview(res.data);
        if (!shouldAdvanceAgain(res.data)) return;
      }
      setError("Still working on a long import. Press Resume to keep going.");
    } finally {
      setBusy(null);
    }
  }, [kind, userId, importId, resync, showReview]);

  const advance = useCallback(async () => {
    stopRef.current = false;
    setBusy(advancingLabel(kind));
    setError(null);
    await advanceLoop();
  }, [kind, advanceLoop]);

  const perform: ImportPerform = useCallback(
    async <T,>(
      label: string,
      op: () => Promise<ImportActionResult<T>>,
      show?: (data: T) => ImportReview | null,
    ) => {
      setBusy(label);
      setError(null);
      let res: ImportActionResult<T>;
      try {
        res = await op();
      } finally {
        setBusy(null);
      }
      if (!res.ok) {
        // The row was resolved elsewhere (another tab): move on.
        if (res.code === "item_not_pending") return advance();
        setError(res.error ?? "That didn't work.");
        if (res.code === "import_not_active") await resync();
        return;
      }
      const next = show && res.data !== undefined ? show(res.data) : null;
      if (next) showReview(next);
      else await advance();
    },
    [advance, resync, showReview],
  );

  async function changeStatus(status: ImportStatus) {
    if (status !== "active") stopRef.current = true;
    setBusy(
      status === "paused" ? "Pausing…" : status === "canceled" ? "Canceling…" : "Resuming…",
    );
    setError(null);
    const res = await setImportStatusAction(kind, userId, importId, status);
    setBusy(null);
    setConfirmCancel(false);
    if (!res.ok || !res.data) {
      setError(res.error ?? "Couldn't change the import.");
      return;
    }
    setJob(res.data);
    setReview(null);
    if (status === "active") await advance();
  }

  // Pick up where the import left off as soon as the page opens.
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    if (initialImport.status === "active") void advanceLoop();
  }, [advanceLoop, initialImport.status]);

  const total = job.total_count;
  const item = review?.item ?? null;
  const resultsPath = IMPORT_KINDS[kind].affects[0];
  const finished = job.status === "completed" || job.status === "canceled";

  const statusLabel = IMPORT_STATUS_LABELS[job.status] ?? job.status;

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[15.5rem_minmax(0,1fr)] lg:gap-7">
      <aside
        aria-label="Import progress"
        className="space-y-4.5 lg:sticky lg:top-20"
      >
        <ImportProgressBar kind={kind} total={total} counts={counts} />
        {/* The full tally is a desktop rail; phones keep the count and bar
            so the item under review comes up sooner. */}
        <div className={finished ? undefined : "max-lg:hidden"}>
          <ImportOutcomeList
            counts={counts}
            pending={finished ? undefined : importPending(total, counts)}
          />
        </div>
        <div className="flex min-h-6 flex-wrap items-center gap-2">
          <Chip tone={job.status === "active" ? "highlight" : "neutral"}>
            {statusLabel}
          </Chip>
          {busy && (
            <span
              role="status"
              className="inline-flex items-center gap-1.5 text-[0.82rem] text-paper-dim"
            >
              <Loader2 aria-hidden className="size-3.5 animate-spin" /> {busy}
            </span>
          )}
        </div>
        {!finished && (
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              {job.status === "active" ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => changeStatus("paused")}
                >
                  <Pause data-icon="inline-start" /> Pause
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="highlight"
                  disabled={!!busy}
                  onClick={() => changeStatus("active")}
                >
                  <Play data-icon="inline-start" /> Resume
                </Button>
              )}
              {!confirmCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setConfirmCancel(true)}
                >
                  <Ban data-icon="inline-start" /> Cancel
                </Button>
              )}
            </div>
            {confirmCancel && (
              <div className="space-y-2.5 rounded-sm border border-destructive/40 p-3">
                <p className="text-[0.85rem] text-paper-dim">
                  Canceling stops the import. Games already added stay in
                  your list.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => changeStatus("canceled")}
                  >
                    Yes, cancel import
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setConfirmCancel(false)}
                  >
                    Keep going
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </aside>

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
          <div className="grid min-h-60 place-items-center rounded-md border border-dashed border-rule-strong px-6 text-center">
            <p className="font-label inline-flex items-center gap-2 text-[0.95rem] font-extrabold tracking-[0.06em] text-paper-dim">
              <Loader2 aria-hidden className="size-4 animate-spin" />
              {busy}
            </p>
          </div>
        )}

        {job.status === "paused" && (
          <div className="rounded-md border border-dashed border-rule-strong px-6 py-12 text-center">
            <h2 className="font-headline text-4xl">Paused</h2>
            <p className="mx-auto mt-2 max-w-[48ch] text-sm text-paper-dim">
              Resume it whenever you like; it picks up at the next{" "}
              {IMPORT_KINDS[kind].itemNoun.one}.
            </p>
          </div>
        )}

        {finished && (
          <section className="space-y-4 rounded-md border border-rule bg-ink-2 p-5 sm:p-6">
            <h2 className="font-headline text-[2.6rem] leading-[0.9]">
              {job.status === "completed" ? "Import finished" : "Import canceled"}
            </h2>
            <p className="text-sm text-paper-dim">
              {job.status === "completed"
                ? "Everything in the file has been dealt with. The tally on the left is how it went."
                : "The import stopped. Anything added before you canceled stays in your list."}
            </p>
            <div className="flex flex-wrap gap-2">
              {resultsPath && (
                <Link
                  href={`/members/${userId}/${resultsPath}`}
                  className={buttonVariants({ variant: "highlight" })}
                >
                  See your list
                </Link>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => router.refresh()}
              >
                <RotateCcw data-icon="inline-start" /> Start another import
              </Button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
