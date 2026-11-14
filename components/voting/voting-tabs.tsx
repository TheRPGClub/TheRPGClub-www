"use client";

import type { ReactNode } from "react";
import type { VotingCategory } from "@/lib/api/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// The board's two tracks as tabs over one rule, each labelled with its count
// in the track's ink. Both boards stay mounted, so switching keeps a board's
// optimistic vote state and costs no request. Arrow keys move between the
// tabs and select as they go.

export interface VotingTab {
  category: VotingCategory;
  label: string;
  count: number;
  panel: ReactNode;
}

const COUNT_TONE: Record<VotingCategory, string> = {
  gotm: "bg-gotm text-gotm-foreground",
  nr_gotm: "bg-nr text-nr-foreground",
};

export function VotingTabs({ tabs }: { tabs: VotingTab[] }) {
  return (
    <Tabs defaultValue={tabs[0]?.category} className="block space-y-5">
      <TabsList
        variant="line"
        aria-label="Ballot tracks"
        activateOnFocus
        className="flex w-auto items-end justify-start gap-0.5 p-0 group-data-horizontal/tabs:h-auto"
      >
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.category}
            value={tab.category}
            className="h-10.5 flex-initial gap-2.5 border-0 px-2.5 py-0 text-[1.2rem] transition-colors after:hidden sm:h-11.5 sm:px-4 sm:text-2xl"
          >
            {tab.label}
            <span
              className={cn(
                "font-label rounded-xs px-1.5 py-px text-[0.8rem] font-extrabold tracking-[0.06em] tabular-nums sm:leading-[calc(2/1.5)]",
                COUNT_TONE[tab.category],
              )}
            >
              <span className="sr-only">(</span>
              {tab.count}
              <span className="sr-only">)</span>
            </span>
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.category} value={tab.category} keepMounted className="text-base">
          {tab.panel}
        </TabsContent>
      ))}
    </Tabs>
  );
}
