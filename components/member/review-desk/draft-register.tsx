"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import type { AutosaveStatus } from "@/lib/reviews/autosave";
import { autosaveLabel } from "@/lib/reviews/draft";
import { cn } from "@/lib/utils";

// The autosave's register square at the head of the Draft strip: hollow
// (nothing new), half inked (saving), solid (saved), dashed (the save failed
// and is waiting to try again, with Retry now beside it).
export function DraftRegister({
  status,
  onRetry,
}: {
  status: AutosaveStatus;
  onRetry: () => void;
}) {
  const now = useNow(status.kind === "failed" ? 1000 : 30_000);
  const failed = status.kind === "failed";

  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <span
        role="status"
        className="font-label flex min-w-0 items-center gap-2 text-[0.8rem] font-extrabold tracking-[0.07em] whitespace-nowrap uppercase"
      >
        <span
          aria-hidden
          className={cn(
            "size-3 shrink-0 border-[1.5px]",
            status.kind === "idle" && "border-faint-foreground",
            status.kind === "saving" &&
              "border-faint-foreground bg-[linear-gradient(90deg,var(--color-faint-foreground)_50%,transparent_50%)]",
            status.kind === "saved" && "border-foreground bg-foreground",
            failed && "border-dashed border-dim-foreground",
          )}
        />
        Draft
        <span className={cn("truncate font-bold tracking-[0.06em]", failed ? "text-dim-foreground" : "text-faint-foreground")}>
          · {autosaveLabel(status, now)}
        </span>
      </span>
      {failed && (
        <Button type="button" variant="pencil" size="inline" onClick={onRetry}>
          Retry now
        </Button>
      )}
    </span>
  );
}

// The clock the "saved 2 min ago" and "retrying in 8s" read from.
function useNow(everyMs: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = setInterval(tick, everyMs);
    return () => clearInterval(id);
  }, [everyMs]);
  return now;
}
