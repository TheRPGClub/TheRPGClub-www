"use client";

import { useState } from "react";
import type { AchievementProvider } from "@/lib/api/types";
import { PROVIDER_LABEL } from "@/lib/achievements";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SetSwitcher } from "./set-switcher";

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
    <Tabs
      value={provider}
      onValueChange={(value) => {
        const next = value as AchievementProvider;
        setProvider(next);
        const tab = tabs.find((t) => t.provider === next);
        if (tab) mirror(next, activeSetId(tab));
      }}
      className="block"
    >
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
        <TabsList
          variant="provider"
          aria-label="Achievement Sets by Provider"
          className="flex overflow-x-auto"
        >
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.provider}
              value={tab.provider}
              style={{ "--tab-ink": PROVIDER_VAR[tab.provider] } as React.CSSProperties}
              className="h-10 flex-none shrink-0 gap-2 border-0 px-3.5 py-0 text-[1rem] sm:px-4"
            >
              {PROVIDER_LABEL[tab.provider]}
              {tab.sets.length > 1 && (
                <span className="text-[0.82rem] opacity-70">{tab.sets.length}</span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {activeTab.sets.length > 1 && (
          <SetSwitcher
            label={`${PROVIDER_LABEL[activeTab.provider]} sets`}
            sets={activeTab.sets}
            value={activeSetId(activeTab)}
            onChange={(id) => {
              setSetIds((prev) => ({ ...prev, [activeTab.provider]: id }));
              mirror(activeTab.provider, id);
            }}
          />
        )}
      </div>

      {tabs.map((tab) => (
        <TabsContent
          key={tab.provider}
          value={tab.provider}
          keepMounted
          className="text-[length:inherit] data-hidden:hidden"
        >
          {tab.sets.map((set) => (
            <div key={set.id} hidden={set.id !== activeSetId(tab)}>
              {set.page}
            </div>
          ))}
        </TabsContent>
      ))}
    </Tabs>
  );
}
