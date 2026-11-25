import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { gotmHistoryHref, gotmRoundHref, type GotmHistoryFilters } from "@/lib/api/gotm-rounds";
import { cn } from "@/lib/utils";

// The Round Page's foot: the older and newer closed rounds either side of
// the way back to the history, each keeping the history's filters.
export function RoundNav({
  previous,
  next,
  filters,
}: {
  previous: number | null;
  next: number | null;
  filters: GotmHistoryFilters;
}) {
  return (
    <nav
      aria-label="Rounds"
      className="mt-9 grid grid-cols-2 gap-2 border-t-2 border-foreground pt-4 md:grid-cols-[1fr_auto_1fr] md:gap-4.5"
    >
      <RoundCard round={previous} filters={filters} side="previous" />
      <Link
        href={gotmHistoryHref(filters)}
        className="font-label flex items-center justify-center pt-1.5 text-[0.85rem] font-bold tracking-[0.12em] text-highlight uppercase hover:underline max-md:col-span-2 max-md:row-start-2 md:pt-0"
      >
        GOTM history
      </Link>
      <RoundCard round={next} filters={filters} side="next" />
    </nav>
  );
}

function RoundCard({
  round,
  filters,
  side,
}: {
  round: number | null;
  filters: GotmHistoryFilters;
  side: "previous" | "next";
}) {
  const next = side === "next";
  const Arrow = next ? ArrowRight : ArrowLeft;
  const body = (
    <>
      {round != null && <Arrow aria-hidden className="size-4.5 shrink-0 text-highlight" />}
      <span className="min-w-0">
        <span className="font-headline block text-[1.0625rem] leading-none uppercase md:text-[1.375rem]">
          {round != null ? `Round ${round}` : next ? "Newest round" : "Oldest round"}
        </span>
        <span className="font-label mt-1 block text-[0.75rem] font-semibold tracking-[0.12em] text-faint-foreground uppercase">
          {round != null ? (next ? "Next round" : "Previous round") : "Nothing further"}
        </span>
      </span>
    </>
  );
  const box = cn(
    "flex items-center gap-3.5 rounded-sm border border-border px-3 py-2.5 md:px-4 md:py-3",
    next && "flex-row-reverse text-right",
  );
  if (round == null) return <div className={cn(box, "opacity-50")}>{body}</div>;
  return (
    <Link href={gotmRoundHref(round, filters)} className={cn(box, "bg-card transition-colors hover:border-highlight")}>
      {body}
    </Link>
  );
}
