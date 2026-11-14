"use client";

import type { ImportJob, ImportSummary } from "@/lib/api/types";
import type { ImportKind } from "@/lib/imports/kinds";
import { ImportProgressRail } from "@/components/imports/import-progress-rail";
import { ImportReviewStage } from "@/components/imports/import-review-stage";
import { useImportReviewLoop } from "@/components/imports/use-import-review-loop";

interface ImportReviewLoopProps {
  kind: ImportKind;
  userId: string;
  initialImport: ImportJob;
  initialCounts: ImportSummary | null;
}

// Drives an import from the browser, for any import kind: calls `advance`
// until a row needs the member (or the import finishes), shows that row's
// review panel, and offers pause, resume and cancel.
export function ImportReviewLoop({
  kind,
  userId,
  initialImport,
  initialCounts,
}: ImportReviewLoopProps) {
  const loop = useImportReviewLoop(kind, userId, initialImport, initialCounts);

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[15.5rem_minmax(0,1fr)] lg:gap-7">
      <ImportProgressRail
        kind={kind}
        job={loop.job}
        counts={loop.counts}
        busy={loop.busy}
        confirmCancel={loop.confirmCancel}
        onConfirmCancel={loop.setConfirmCancel}
        onChangeStatus={loop.changeStatus}
      />
      <ImportReviewStage
        kind={kind}
        userId={userId}
        job={loop.job}
        review={loop.review}
        busy={loop.busy}
        error={loop.error}
        perform={loop.perform}
      />
    </div>
  );
}
