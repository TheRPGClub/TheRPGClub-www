"use client";

import type { ReactNode } from "react";
import { Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// The line under a held delete: what was deleted, a signal-orange bar that
// drains over the hold, and Undo. Pair it with useUndoDelete; the delete is
// sent when the bar runs out, not when this mounts.
export function UndoBar({
  message,
  delayMs,
  onUndo,
  className,
}: {
  message: ReactNode;
  delayMs: number;
  onUndo: () => void;
  className?: string;
}) {
  const seconds = Math.round(delayMs / 1000);
  return (
    <div role="status" className={cn("flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-[0.84rem] text-destructive", className)}>
      <span>
        {message}
        <span className="sr-only"> Undo within {seconds} seconds.</span>
      </span>
      <span aria-hidden className="relative h-0.5 min-w-16 flex-1 overflow-hidden bg-rule">
        <span
          className="absolute inset-0 origin-left bg-destructive motion-safe:animate-[undo-drain_linear_forwards]"
          style={{ animationDuration: `${delayMs}ms` }}
        />
      </span>
      <Button type="button" variant="outline" size="sm" onClick={onUndo}>
        <Undo2 data-icon="inline-start" />
        Undo
      </Button>
    </div>
  );
}
