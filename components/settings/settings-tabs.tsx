"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SETTINGS_TAB_LABELS, settingsTabHref, type SettingsTab } from "@/lib/settings-tabs";

export interface SettingsTabItem {
  key: SettingsTab;
  // The tab's state under its name ("7 of 9 shown"); empty for none.
  note: string;
  panel: React.ReactNode;
}

// /settings' tabs in the masthead voice: each name in Anton with its state
// under it, the open one in paper over the red you-are-here bar. Switching
// replaces the URL (`?tab=`) without a navigation, and every panel stays
// mounted, so a half-typed Birth Date or a switch mid-save survives a trip
// to another tab. On a phone the row scrolls sideways.
export function SettingsTabs({ initial, tabs }: { initial: SettingsTab; tabs: SettingsTabItem[] }) {
  const [tab, setTab] = useState<SettingsTab>(initial);

  return (
    <Tabs
      value={tab}
      onValueChange={(value) => {
        const next = value as SettingsTab;
        setTab(next);
        window.history.replaceState(null, "", settingsTabHref(next));
      }}
      className="block"
    >
      <TabsList
        variant="masthead"
        aria-label="Settings"
        className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0"
      >
        {tabs.map((t) => (
          <TabsTrigger key={t.key} value={t.key} className="h-auto flex-none flex-col items-start gap-1.5 px-0 pt-1 pb-3">
            <span className="font-headline text-[1.4rem] leading-none sm:text-[1.7rem]">
              {SETTINGS_TAB_LABELS[t.key]}
            </span>
            {t.note && (
              <span className="font-label text-xs font-semibold tracking-[0.06em] text-faint-foreground">
                {t.note}
              </span>
            )}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((t) => (
        <TabsContent key={t.key} value={t.key} keepMounted className="pt-8 text-base">
          {t.panel}
        </TabsContent>
      ))}
    </Tabs>
  );
}
