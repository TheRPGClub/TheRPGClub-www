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
import { ImportOutcomeList, ImportProgressBar } from "@/components/imports/import-progress";
import { Badge } from "@/components/ui/badge";
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

  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-2xl border bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Badge variant={job.status === "active" ? "default" : "secondary"}>
              {IMPORT_STATUS_LABELS[job.status] ?? job.status}
            </Badge>
            {busy && (
              <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin" /> {busy}
              </span>
            )}
          </div>
          {!finished && (
            <div className="flex flex-wrap items-center gap-2">
              {job.status === "active" ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => changeStatus("paused")}
                >
                  <Pause /> Pause
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  disabled={!!busy}
                  onClick={() => changeStatus("active")}
                >
                  <Play /> Resume
                </Button>
              )}
              {confirmCancel ? (
                <>
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
                </>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setConfirmCancel(true)}
                >
                  <Ban /> Cancel
                </Button>
              )}
            </div>
          )}
        </div>

        <ImportProgressBar kind={kind} total={total} counts={counts} />
        {confirmCancel && (
          <p className="text-sm text-muted-foreground">
            Canceling stops the import. Games already added stay in your list.
          </p>
        )}
      </div>

      {error && (
        <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      {job.status === "active" && item && review && (
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <ImportItemPanel
            key={item.item_id}
            kind={kind}
            userId={userId}
            review={{ ...review, item }}
            disabled={!!busy}
            perform={perform}
          />
        </div>
      )}

      {job.status === "paused" && (
        <p className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
          This import is paused. Resume it whenever you like; it picks up at the
          next {IMPORT_KINDS[kind].itemNoun.one}.
        </p>
      )}

      {finished && (
        <div className="space-y-4 rounded-2xl border bg-card p-5 shadow-sm">
          <h2 className="text-lg font-semibold">
            {job.status === "completed" ? "Import finished" : "Import canceled"}
          </h2>
          <ImportOutcomeList counts={counts} />
          <div className="flex flex-wrap gap-2">
            {resultsPath && (
              <Link
                href={`/members/${userId}/${resultsPath}`}
                className={buttonVariants({ variant: "default", size: "sm" })}
              >
                See your list
              </Link>
            )}
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => router.refresh()}
            >
              <RotateCcw /> Start another import
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
