import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

// A row's quiet cue that it can be dragged: shown while the row is hovered
// or focused (the whole row drags, not just this). Hidden on touch, where a
// press and hold lifts the row.
export function SortGrip({ className }: { className?: string }) {
  return <GripVertical aria-hidden data-sort-grip="" className={cn("size-4 shrink-0", className)} />;
}
