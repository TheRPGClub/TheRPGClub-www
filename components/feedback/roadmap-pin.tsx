import Link from "next/link";
import { Check } from "lucide-react";
import type { FeedbackRoadmap } from "@/lib/api/types";
import { roadmapPinLine } from "@/lib/roadmap/feedback";
import { ROADMAP_PATH } from "@/lib/roadmap/tree";
import { cn } from "@/lib/utils";

// The Roadmap badge (design pick 3, "Pinned node"): a Skill Tree node
// pinned to a linked Feedback card's top-right corner at a 3deg tilt with
// the stamp shadow. "On the Roadmap" over the item's Milestone, its ring in
// yellow while planned; green with a filled tick once Shipped. It opens
// /roadmap. The card hides it when the API sends no `roadmap`. It hangs
// above the card's top-right corner, just over its edge, so the header band
// keeps its own layout; a board with badges leaves room above each row
// (PIN_ROOM).
// The grid's row gap and top padding when any card wears the badge.
export const PIN_ROOM = "gap-y-12 pt-11";

export function RoadmapPin({ roadmap }: { roadmap: FeedbackRoadmap }) {
  const shipped = roadmap.shipped;
  const line = roadmapPinLine(roadmap);
  return (
    <Link
      href={ROADMAP_PATH}
      title={`On the Roadmap: ${line}`}
      className={cn(
        "absolute -top-10 -right-2.5 z-10 flex w-[9.5rem] rotate-3 items-center gap-2 rounded-[3px] bg-card px-2.5 py-1.5 transition-transform duration-150 ease-out hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight motion-reduce:transition-none",
        shipped
          ? "shadow-[inset_0_0_0_1.5px_var(--color-ok),0_6px_14px_rgb(0_0_0/0.45)]"
          : "shadow-[inset_0_0_0_1.5px_var(--color-highlight),0_6px_14px_rgb(0_0_0/0.45)]",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "grid size-5 shrink-0 place-items-center rounded-[2px]",
          shipped ? "bg-ok text-background" : "shadow-[inset_0_0_0_1.5px_var(--color-highlight)]",
        )}
      >
        {shipped && <Check className="size-3.5 stroke-[3]" />}
      </span>
      <span className="font-label min-w-0 leading-tight">
        <span className="block text-[0.625rem] font-bold text-faint-foreground">
          On the Roadmap
          <span className="sr-only">: </span>
        </span>
        <span className="block truncate text-[0.75rem] font-extrabold text-foreground">
          {line}
        </span>
      </span>
    </Link>
  );
}
