"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NoticeSlip } from "@/components/issue/notice-slip";

// A list change that didn't save: the list has already gone back; the slip
// says why and stays until dismissed or the next change. Pinned over the
// foot of the page, clear of the phone's tab bar.
export function SaveSlip({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div className="pointer-events-none fixed right-4 bottom-[calc(6.5rem+env(safe-area-inset-bottom))] left-4 z-40 flex justify-end sm:left-auto md:right-7 md:bottom-7">
      <NoticeSlip role="alert" title="Not saved" className="pointer-events-auto max-w-sm pr-10">
        {message}
        <Button variant="inverse-ghost" size="icon-sm" aria-label="Dismiss" onClick={onDismiss} className="absolute top-2 right-2">
          <X />
        </Button>
      </NoticeSlip>
    </div>
  );
}
