"use client";

import { Ban, Pause, Play } from "lucide-react";
import type { ImportStatus } from "@/lib/api/types";
import { Button } from "@/components/ui/button";

// Pause or resume an open import, and cancel it behind a confirmation.
export function ImportStatusControls({
  status,
  busy,
  confirmCancel,
  onConfirmCancel,
  onChangeStatus,
}: {
  status: ImportStatus;
  busy: boolean;
  confirmCancel: boolean;
  onConfirmCancel: (open: boolean) => void;
  onChangeStatus: (status: ImportStatus) => void;
}) {
  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center gap-2">
        {status === "active" ? (
          <Button type="button" variant="outline" onClick={() => onChangeStatus("paused")}>
            <Pause data-icon="inline-start" /> Pause
          </Button>
        ) : (
          <Button
            type="button"
            variant="highlight"
            disabled={busy}
            onClick={() => onChangeStatus("active")}
          >
            <Play data-icon="inline-start" /> Resume
          </Button>
        )}
        {!confirmCancel && (
          <Button type="button" variant="outline" onClick={() => onConfirmCancel(true)}>
            <Ban data-icon="inline-start" /> Cancel
          </Button>
        )}
      </div>
      {confirmCancel && (
        <div className="space-y-2.5 rounded-sm border border-destructive/40 p-3">
          <p className="text-[0.85rem] text-dim-foreground">
            Canceling stops the import. Games already added stay in
            your list.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={() => onChangeStatus("canceled")}
            >
              Yes, cancel import
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => onConfirmCancel(false)}
            >
              Keep going
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
