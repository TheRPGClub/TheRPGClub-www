"use client";

import { X } from "lucide-react";
import type { GameEditSaveNotice } from "@/hooks/use-game-edit";
import { Button } from "@/components/ui/button";
import { NoticeSlip } from "@/components/issue/notice-slip";

// After a Save all where a section failed: "4 saved, 1 failed", naming the
// sections that didn't save. Their errors show inline in each section, and
// their edits are still staged.
export function SaveFailedSlip({ notice, onDismiss }: { notice: GameEditSaveNotice; onDismiss: () => void }) {
  const names = notice.failed.join(", ");
  return (
    <div className="mt-6 mb-1 ml-1.5 flex">
      <NoticeSlip role="alert" title={notice.title} className="max-w-sm pr-10">
        <strong>{names}</strong> didn&apos;t save; {notice.failed.length === 1 ? "its" : "their"} changes are still staged.
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
