"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  advanceImportAction,
  loadImportAction,
  setImportStatusAction,
  type ImportActionResult,
} from "@/app/actions/imports";
import type { ImportJob, ImportReview, ImportStatus, ImportSummary } from "@/lib/api/types";
import { IMPORT_KINDS, shouldAdvanceAgain, type ImportKind } from "@/lib/imports/kinds";
import type { ImportPerform } from "@/components/imports/import-item-panel";

// Safety net for the "call advance again" loop: each call resolves up to 25
// rows, so this covers 5,000 automatic rows before asking the member to go on.
const MAX_ADVANCE_ROUNDS = 200;
const advancingLabel = (kind: ImportKind) =>
  `Working through your ${IMPORT_KINDS[kind].itemNoun.other}…`;

// Drives an import from the browser: calls `advance` until a row needs the
// member (or the import finishes), and runs item actions and status changes.
// Each item action goes through `perform`, which advances again once it
// succeeds.
export function useImportReviewLoop(
  kind: ImportKind,
  userId: string,
  initialImport: ImportJob,
  initialCounts: ImportSummary | null,
) {
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

  // Pause, cancel or resume.
  async function changeStatus(status: ImportStatus) {
    if (status !== "active") stopRef.current = true;
    setBusy(status === "paused" ? "Pausing…" : status === "canceled" ? "Canceling…" : "Resuming…");
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

  const state = { job, review, counts, busy, error, confirmCancel };
  return { ...state, setConfirmCancel, perform, changeStatus };
}
