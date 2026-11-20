"use client";

import { RotateCcw, X } from "lucide-react";
import { revertNote, type PanelChange } from "@/lib/dashboard/panel-edit";
import { Button } from "@/components/ui/button";
import { NoticeSlip } from "@/components/issue/notice-slip";

// A dashboard change that didn't save (the final round's "Not saved",
// restyled to B): the panels have already gone back; this slip says what
// went back, offers the change again and stays until dismissed or the next
// change. Pinned over the foot of the page, clear of the phone's tab bar.
export function SaveNotice({
  change,
  onRetry,
  onDismiss,
}: {
  change: PanelChange;
  onRetry: () => void;
  onDismiss: () => void;
}) {
  return (
    <div className="pointer-events-none fixed right-4 bottom-[calc(6.5rem+env(safe-area-inset-bottom))] left-4 z-40 flex justify-end sm:left-auto md:right-7 md:bottom-7">
      <NoticeSlip
        role="alert"
        title="Not saved"
        className="pointer-events-auto max-w-sm pr-10"
        action={
          <Button variant="inverse" size="sm" onClick={onRetry}>
            <RotateCcw aria-hidden />
            Try again
          </Button>
        }
      >
        <strong>Couldn&apos;t save your dashboard.</strong> {revertNote(change)}
        <Button
          variant="inverse-ghost"
          size="icon-sm"
          aria-label="Dismiss"
          onClick={onDismiss}
          className="absolute top-2 right-2"
        >
          <X />
        </Button>
      </NoticeSlip>
    </div>
  );
}
