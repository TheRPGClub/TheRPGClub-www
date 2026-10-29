import type { ReactNode } from "react";
import type { VotingCategory } from "@/lib/api/types";
import { cn } from "@/lib/utils";

// The ballot strip at the head of /voting, in the nominations yellow: a
// monumental clock for the live window, then one slot per track for the
// viewer's own business in it (their nomination, their votes, or the
// result).

const DOT: Record<VotingCategory, string> = {
  gotm: "bg-gotm",
  nr_gotm: "bg-nr",
};

export interface StripClock {
  // The big figure: days left, or a word once the vote is over.
  figure: string;
  label: string;
  detail: string;
}

export interface StripSlot {
  category: VotingCategory;
  title: string;
  content: ReactNode;
}

export function VotingStrip({
  label,
  clock,
  slots,
}: {
  label: string;
  clock: StripClock;
  slots: StripSlot[];
}) {
  const numeric = /^\d+$/.test(clock.figure);
  return (
    <section
      aria-label={label}
      className="grid overflow-hidden rounded-md bg-highlight text-ink md:grid-cols-[12.5rem_1fr_1fr] xl:grid-cols-[16.25rem_1fr_1fr]"
    >
      <div className="flex items-center gap-4 border-b-2 border-ink px-5 py-4 md:flex-col md:items-start md:justify-between md:border-r-2 md:border-b-0 md:py-5 xl:px-5.5">
        <p
          className={cn(
            "font-headline shrink-0 leading-[0.78]",
            numeric
              ? "text-[4.5rem] md:text-[5.5rem] xl:text-[6.875rem]"
              : "text-[3rem] md:text-[3.5rem] xl:text-[4.25rem]",
          )}
        >
          {clock.figure}
        </p>
        <p className="font-label text-[0.95rem] leading-[1.15] font-extrabold tracking-[0.08em]">
          {clock.label}
          <span className="mt-1.5 block font-sans text-[0.82rem] leading-snug font-medium tracking-normal text-highlight-ink normal-case">
            {clock.detail}
          </span>
        </p>
      </div>
      {slots.map((slot, i) => (
        <div
          key={slot.category}
          className={cn(
            "flex min-w-0 flex-col gap-2.5 px-5 py-4.5",
            i > 0 && "border-t-2 border-ink md:border-t-0 md:border-l-2",
          )}
        >
          <h2 className="font-label flex items-center gap-2 text-[0.85rem] font-extrabold tracking-[0.08em]">
            <span
              aria-hidden
              className={cn("size-2.5 shrink-0 rounded-full", DOT[slot.category])}
            />
            {slot.title}
          </h2>
          {slot.content}
        </div>
      ))}
    </section>
  );
}
