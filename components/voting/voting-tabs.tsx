"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import type { VotingCategory } from "@/lib/api/types";
import { cn } from "@/lib/utils";

// The board's two tracks as tabs over one rule, each labelled with its count
// in the track's ink. Both boards stay mounted, so switching keeps a board's
// optimistic vote state and costs no request.

export interface VotingTab {
  category: VotingCategory;
  label: string;
  count: number;
  panel: ReactNode;
}

const COUNT_TONE: Record<VotingCategory, string> = {
  gotm: "bg-gotm text-white",
  nr_gotm: "bg-nr text-white",
};

export function VotingTabs({ tabs }: { tabs: VotingTab[] }) {
  const id = useId();
  const [active, setActive] = useState(tabs[0]?.category);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  // Arrow keys move between tabs, per the WAI-ARIA tabs pattern.
  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next =
      (index + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
    setActive(tabs[next].category);
    buttons.current[next]?.focus();
  };

  return (
    <div className="space-y-5">
      <div
        role="tablist"
        aria-label="Ballot tracks"
        className="flex items-end gap-0.5 border-b-2 border-paper"
      >
        {tabs.map((tab, i) => {
          const selected = tab.category === active;
          return (
            <button
              key={tab.category}
              ref={(el) => {
                buttons.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`${id}-tab-${tab.category}`}
              aria-selected={selected}
              aria-controls={`${id}-panel-${tab.category}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(tab.category)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={cn(
                "font-headline inline-flex h-10.5 items-center gap-2.5 rounded-t-sm px-2.5 text-[1.2rem] transition-colors sm:h-11.5 sm:px-4 sm:text-2xl",
                selected
                  ? "bg-paper text-ink"
                  : "text-paper-mute hover:text-paper",
              )}
            >
              {tab.label}
              <span
                className={cn(
                  "font-label rounded-xs px-1.5 py-px text-[0.8rem] font-extrabold tracking-[0.06em] tabular-nums",
                  COUNT_TONE[tab.category],
                )}
              >
                <span className="sr-only">(</span>
                {tab.count}
                <span className="sr-only">)</span>
              </span>
            </button>
          );
        })}
      </div>
      {tabs.map((tab) => (
        <div
          key={tab.category}
          role="tabpanel"
          id={`${id}-panel-${tab.category}`}
          aria-labelledby={`${id}-tab-${tab.category}`}
          hidden={tab.category !== active}
        >
          {tab.panel}
        </div>
      ))}
    </div>
  );
}
