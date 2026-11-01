"use client";

import { useState } from "react";
import { Tabs } from "@base-ui/react/tabs";
import type { AchievementProvider } from "@/lib/api/types";
import { PROVIDER_LABEL } from "@/lib/achievements";
import { cn } from "@/lib/utils";

// The game page's Provider tabs: one index tab per Provider with a set, in
// its Provider colour, sitting on the page's top edge. A Provider with
// several sets (PS4 and PS5 lists) gets a set switcher at the row's end.
// Every page is rendered on the server; the tabs only choose which shows.
// The choice is mirrored into `?ach=` (and `?ach_set=`) so it can be shared.

export interface GameAchievementTab {
  provider: AchievementProvider;
  sets: { id: number; label: string; page: React.ReactNode }[];
}

const PROVIDER_VAR: Record<AchievementProvider, string> = {
  retroachievements: "var(--color-provider-retroachievements)",
  steam: "var(--color-provider-steam)",
  psn: "var(--color-provider-psn)",
};

export function GameAchievementTabs({
  tabs,
  initialProvider,
  initialSetId,
}: {
  tabs: GameAchievementTab[];
  initialProvider: AchievementProvider;
  initialSetId: number;
}) {
  const [provider, setProvider] = useState(initialProvider);
  const [setIds, setSetIds] = useState<Partial<Record<AchievementProvider, number>>>(
    () => ({ [initialProvider]: initialSetId }),
  );

  const activeTab = tabs.find((t) => t.provider === provider) ?? tabs[0];
  const activeSetId = (tab: GameAchievementTab) =>
    tab.sets.find((s) => s.id === setIds[tab.provider])?.id ?? tab.sets[0].id;

  function mirror(next: AchievementProvider, setId: number) {
    const tab = tabs.find((t) => t.provider === next);
    const url = new URL(window.location.href);
    url.searchParams.set("ach", next);
    if (tab && tab.sets.length > 1 && setId !== tab.sets[0].id) {
      url.searchParams.set("ach_set", String(setId));
    } else {
      url.searchParams.delete("ach_set");
    }
    window.history.replaceState(window.history.state, "", url);
  }

  return (
    <Tabs.Root
      value={provider}
      onValueChange={(value) => {
        const next = value as AchievementProvider;
        setProvider(next);
        const tab = tabs.find((t) => t.provider === next);
        if (tab) mirror(next, activeSetId(tab));
      }}
    >
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
        <Tabs.List
          aria-label="Achievement Sets by Provider"
          className="flex gap-1 overflow-x-auto"
        >
          {tabs.map((tab) => (
            <Tabs.Tab
              key={tab.provider}
              value={tab.provider}
              style={{ "--pc": PROVIDER_VAR[tab.provider] } as React.CSSProperties}
              className={cn(
                "font-label inline-flex h-10 shrink-0 items-center gap-2 rounded-t-[3px] px-3.5 text-[1rem] font-extrabold tracking-[0.06em] whitespace-nowrap outline-none sm:px-4",
                "bg-ink-2 text-paper-dim shadow-[inset_0_3px_0_var(--pc)] transition-colors hover:bg-ink-3 hover:text-paper",
                "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-highlight",
                "data-active:bg-(--pc) data-active:text-ink data-active:shadow-none",
              )}
            >
              {PROVIDER_LABEL[tab.provider]}
              {tab.sets.length > 1 && (
                <span className="text-[0.82rem] opacity-70">{tab.sets.length}</span>
              )}
            </Tabs.Tab>
          ))}
        </Tabs.List>

        {activeTab.sets.length > 1 && (
          <div
            role="group"
            aria-label={`${PROVIDER_LABEL[activeTab.provider]} sets`}
            className="mb-1.5 flex gap-0.5"
          >
            {activeTab.sets.map((set) => {
              const on = set.id === activeSetId(activeTab);
              return (
                <button
                  key={set.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => {
                    setSetIds((prev) => ({ ...prev, [activeTab.provider]: set.id }));
                    mirror(activeTab.provider, set.id);
                  }}
                  className={cn(
                    "font-label inline-flex h-7.5 items-center rounded-[3px] px-2.5 text-[0.88rem] font-extrabold tracking-[0.06em] transition-colors outline-none",
                    "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-highlight",
                    on ? "bg-paper text-ink" : "text-paper-mute hover:bg-ink-3 hover:text-paper",
                  )}
                >
                  {set.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {tabs.map((tab) => (
        <Tabs.Panel
          key={tab.provider}
          value={tab.provider}
          keepMounted
          className="outline-none data-hidden:hidden"
        >
          {tab.sets.map((set) => (
            <div key={set.id} hidden={set.id !== activeSetId(tab)}>
              {set.page}
            </div>
          ))}
        </Tabs.Panel>
      ))}
    </Tabs.Root>
  );
}
