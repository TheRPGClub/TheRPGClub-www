import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { LaneCell, TimelineLane } from "@/lib/challenges/slots-timeline";
import { cn } from "@/lib/utils";
import { MemberMark } from "@/components/challenges/host-badge";

// One member's lane on the shared year axis (surface brief challenges-slots,
// 3B): their mark, name and first year, a cell per year (paper Cleared, an
// outline open, striped where an In Progress game fits, nothing before their
// first year, whose cell wears the tint's hi ring), the score and the arrow.
// The whole lane opens their Run in the panel above. On phones the name
// column drops to the mark.

export const LANE_GRID =
  "grid grid-cols-[30px_minmax(0,1fr)_58px_14px] items-center gap-x-2 sm:grid-cols-[230px_minmax(0,1fr)_92px_34px] sm:gap-x-0";

const CELL: Record<LaneCell, string> = {
  cleared: "bg-foreground",
  open: "shadow-[inset_0_0_0_1.5px_var(--color-border-strong)]",
  fits: "shadow-[inset_0_0_0_1.5px_var(--challenge-tint-hi)] bg-[repeating-linear-gradient(135deg,var(--challenge-tint-hi)_0_2px,transparent_2px_5px)]",
  none: "",
};

export function TimelineLaneRow({ lane, href, selected }: { lane: TimelineLane; href: string; selected: boolean }) {
  const done = lane.caughtUp ? "Caught Up" : lane.status === "finished" ? "Finished" : null;
  return (
    <Link
      href={href}
      aria-current={selected ? "true" : undefined}
      aria-label={`${lane.name}'s Run, from ${lane.firstYear}: ${lane.cleared} of ${lane.target} Cleared${done ? `, ${done}` : ""}`}
      className={cn(
        LANE_GRID,
        "group -mx-2.5 rounded-md border-b border-border px-2.5 py-[7px] transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight",
        selected && "border-transparent bg-card shadow-[inset_0_0_0_2px_var(--color-highlight)] hover:bg-card",
        (lane.status === "abandoned" || lane.status === "expired") && "opacity-75",
      )}
    >
      <span className="flex min-w-0 items-center gap-[9px]">
        <MemberMark name={lane.name} src={lane.avatarUrl} size={26} />
        <span className="min-w-0 max-sm:sr-only">
          <span className="block truncate text-[0.95rem] font-semibold">{lane.name}</span>
          <small className="block text-[0.78rem] leading-[1.1] text-faint-foreground">from {lane.firstYear}</small>
        </span>
      </span>
      <span
        aria-hidden
        className="grid gap-px sm:gap-[3px]"
        style={{ gridTemplateColumns: `repeat(${lane.cells.length}, minmax(0, 1fr))` }}
      >
        {lane.cells.map((cell, i) => (
          <i
            key={i}
            className={cn(
              "h-5 rounded-[1.5px] sm:h-6",
              CELL[cell],
              i === lane.firstIndex && "outline-2 outline-offset-0 outline-(--challenge-tint-hi) outline-solid",
            )}
          />
        ))}
      </span>
      <span className="text-right">
        <span className="font-headline text-[1.1rem] leading-none sm:text-[1.375rem]">
          {lane.cleared}
          <em className="text-[0.75rem] text-faint-foreground not-italic sm:text-[0.875rem]"> / {lane.target}</em>
        </span>
        {done && (
          <span className="font-label block text-[0.6rem] leading-[1.3] font-extrabold tracking-[0.04em] whitespace-nowrap sm:tracking-[0.08em] text-(--challenge-tint-hi) uppercase sm:text-[0.7rem]">
            {done}
          </span>
        )}
      </span>
      <ArrowRight
        aria-hidden
        className={cn(
          "size-4 justify-self-end transition-colors",
          selected ? "text-highlight" : "text-faint-foreground group-hover:text-foreground",
        )}
      />
    </Link>
  );
}
