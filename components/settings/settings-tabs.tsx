"use client";

import { useState } from "react";
import { MastheadTabs } from "@/components/templates/masthead-tabs";
import { SETTINGS_TAB_LABELS, settingsTabHref, type SettingsTab } from "@/lib/settings-tabs";

export interface SettingsTabItem {
  key: SettingsTab;
  // The tab's state under its name ("7 of 9 shown"); empty for none.
  note: string;
  panel: React.ReactNode;
}

// /settings' tabs (MastheadTabs). Switching replaces the URL (`?tab=`)
// without a navigation; every panel stays mounted, so a half-typed Birth
// Date or a switch mid-save survives a trip to another tab.
export function SettingsTabs({ initial, tabs }: { initial: SettingsTab; tabs: SettingsTabItem[] }) {
  const [tab, setTab] = useState<SettingsTab>(initial);

  return (
    <MastheadTabs
      label="Settings"
      value={tab}
      onValueChange={(next) => {
        setTab(next);
        window.history.replaceState(null, "", settingsTabHref(next));
      }}
      tabs={tabs.map((t) => ({ ...t, label: SETTINGS_TAB_LABELS[t.key] }))}
    />
  );
}
