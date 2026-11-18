"use client";

import { useId } from "react";
import { staffStopConfirm } from "@/lib/staff-birth-date";
import { Button } from "@/components/ui/button";

// The one-line confirm under the sharing row once staff flip it off: staff
// can't turn sharing back on, so a wrong member's switch costs that member
// a trip to their settings. Keep it is the safe default and takes the focus.
export function StopSharingConfirm({
  name,
  onStop,
  onKeep,
}: {
  name: string;
  onStop: () => void;
  onKeep: () => void;
}) {
  const promptId = useId();

  return (
    <div role="group" aria-labelledby={promptId} className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
      <p id={promptId} className="text-sm text-foreground">
        {staffStopConfirm(name)}
      </p>
      <span className="flex items-center gap-1">
        <Button type="button" variant="destructive-ghost" size="sm" onClick={onStop}>
          Stop sharing
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onKeep} autoFocus>
          Keep it
        </Button>
      </span>
    </div>
  );
}
