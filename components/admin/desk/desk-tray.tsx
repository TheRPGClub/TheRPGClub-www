"use client";

import Link from "next/link";
import { ArrowRight, CalendarClock, CircleCheck, Lightbulb, TriangleAlert, Vote } from "lucide-react";
import type { TrayCard } from "@/lib/desk-tray";
import { useDesk } from "@/components/admin/desk/desk-context";
import { cn } from "@/lib/utils";

const ICON = { round: Vote, suggestions: Lightbulb, failed: TriangleAlert, live: CalendarClock };

// The in-tray: one card per thing waiting on staff, as a big numeral on a
// card with a 4px bar (yellow for the club's open business, signal orange
// for a failure), its line, and the way in. The failed card opens Bot jobs
// on its failed jobs in place. A quiet desk says so in one dashed line.
export function DeskTray({ cards }: { cards: TrayCard[] }) {
  const { openJobs } = useDesk();
  if (cards.length === 0) {
    return (
      <p className="mt-7 flex items-center gap-3 rounded-md border border-dashed border-border-strong px-5 py-4 text-dim-foreground">
        <CircleCheck aria-hidden className="size-5 shrink-0 text-ok" />
        Nothing waiting on the desk: no open round, no pending Suggestions, no failed bot jobs.
      </p>
    );
  }
  return (
    <ul aria-label="Waiting on the desk" className="mt-7 grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = ICON[card.key];
        return (
          <li key={card.key} className="min-w-0">
            <Link
              href={card.href ?? "/admin?tab=jobs&show=failed"}
              onClick={(e) => {
                if (card.href) return;
                e.preventDefault();
                openJobs("failed");
              }}
              className={cn(
                "group/card relative flex h-full flex-col overflow-hidden rounded-md bg-card shadow-[inset_0_0_0_1px_var(--color-border)] transition-[box-shadow,translate] outline-none before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-border-strong hover:-translate-y-0.5 hover:shadow-[inset_0_0_0_1px_var(--color-border-strong)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                card.tone === "open" && "before:bg-highlight",
                card.tone === "bad" && "before:bg-destructive",
              )}
            >
              <span className="flex items-start justify-between px-3.5 pt-4 sm:px-5 sm:pt-5.5">
                <span
                  className={cn(
                    "font-headline text-[3.6rem] leading-[0.78] sm:text-[5.5rem]",
                    card.tone === "open" && "text-highlight",
                    card.tone === "bad" && "text-destructive",
                    card.tone === "plain" && "text-foreground",
                  )}
                >
                  {card.numeral}
                </span>
                <Icon aria-hidden className="mt-1 hidden size-5.5 text-faint-foreground sm:block" />
              </span>
              <span className="font-label px-3.5 pt-3 text-[0.9rem] leading-tight font-extrabold tracking-[0.06em] sm:px-5 sm:pt-3.5 sm:text-[1.05rem]">
                {card.title}
              </span>
              <span className="flex-1 px-3.5 pt-1 pb-3 text-[0.8rem] text-dim-foreground sm:px-5 sm:pb-4.5 sm:text-sm">
                {card.line}
              </span>
              <span className="font-label flex items-center justify-between border-t border-border px-3.5 py-2.5 text-[0.76rem] font-extrabold tracking-[0.06em] sm:px-5 sm:text-[0.82rem]">
                {card.action}
                <ArrowRight aria-hidden className="size-4 transition-transform group-hover/card:translate-x-0.5 motion-reduce:transition-none" />
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
