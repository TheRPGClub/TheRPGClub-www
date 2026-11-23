"use client";

import { Loader2 } from "lucide-react";
import type { ImportJob, ImportStatus, ImportSummary } from "@/lib/api/types";
import { IMPORT_STATUS_LABELS, type ImportKind } from "@/lib/imports/kinds";
import {
  ImportOutcomeList,
  ImportProgressBar,
  importPending,
} from "@/components/imports/import-progress";
import { ImportStatusControls } from "@/components/imports/import-status-controls";
import { Badge } from "@/components/ui/badge";

// The review's side rail: the count and bar, the tally, the status and what
// is running, and the controls while the import is open.
export function ImportProgressRail({
  kind,
  job,
  counts,
  busy,
  confirmCancel,
  onConfirmCancel,
  onChangeStatus,
}: {
  kind: ImportKind;
  job: ImportJob;
  counts: ImportSummary | null;
  busy: string | null;
  confirmCancel: boolean;
  onConfirmCancel: (open: boolean) => void;
  onChangeStatus: (status: ImportStatus) => void;
}) {
  const total = job.total_count;
  const finished = job.status === "completed" || job.status === "canceled";

  return (
    <aside aria-label="Import progress" className="space-y-4.5 lg:sticky lg:top-5">
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
        <Badge tone={job.status === "active" ? "highlight" : "neutral"} className="border-0">
          {IMPORT_STATUS_LABELS[job.status] ?? job.status}
        </Badge>
        {busy && (
          <span
            role="status"
            className="inline-flex items-center gap-1.5 text-[0.82rem] text-dim-foreground"
          >
            <Loader2 aria-hidden className="size-3.5 motion-safe:animate-spin" /> {busy}
          </span>
        )}
      </div>
      {!finished && (
        <ImportStatusControls
          status={job.status}
          busy={!!busy}
          confirmCancel={confirmCancel}
          onConfirmCancel={onConfirmCancel}
          onChangeStatus={onChangeStatus}
        />
      )}
    </aside>
  );
}
