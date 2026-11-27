import type { BirthDate } from "@/lib/birth-date";
import type { ChallengeDmsData } from "@/lib/challenge-settings";
import type { FeaturePreferences } from "@/lib/feature-preferences";
import type { NewsCategoryPreferences } from "@/lib/news-category-preferences";
import type { StaffSection } from "@/lib/staff";
import type { ThemeCard } from "@/lib/theme-picker";
import {
  featuresTabNote,
  layoutTabNote,
  notificationsTabNote,
  settingsTabsFor,
  staffTabNote,
  youTabNote,
  type SettingsTab,
} from "@/lib/settings-tabs";
import { PageHeader } from "@/components/templates/page-header";
import { SettingsTabs, type SettingsTabItem } from "@/components/settings/settings-tabs";
import { YouTab } from "@/components/settings/you-tab";
import { FeaturesTab } from "@/components/settings/features-tab";
import { NotificationsTab } from "@/components/settings/notifications-tab";
import { LayoutTab } from "@/components/settings/layout-tab";
import { StaffTab } from "@/components/settings/staff-tab";
import type { HiddenPlatformsData } from "@/components/settings/hidden-platforms-list";

export interface SettingsViewProps {
  // The tab `?tab=` asks for, already checked against the viewer.
  tab: SettingsTab;
  // Null when the preferences couldn't be read.
  prefs: FeaturePreferences | null;
  // The member saved their own Pinned Pages / Dashboard Panels.
  pinsCustomised: boolean;
  // The club default Pinned Pages by name ("Voting, Games, Members and News").
  pinsDefault: string;
  panelsCustomised: boolean;
  // The Theme picker's cards, for Your layout's top row (ticket www#250;
  // its look is still being picked). Null leaves the row out.
  themes: ThemeCard[] | null;
  // Null for a member who can't open the News Hub, or when the read failed.
  newsCategories: NewsCategoryPreferences | null;
  // Null for a member who can't use the Release Calendar.
  hiddenPlatforms: HiddenPlatformsData | null;
  // Null when the Birth Date couldn't be read.
  birthDate: BirthDate | null;
  // Moderator or above: the Staff tab, and Birth Date changes aren't limited.
  staff: boolean;
  // The desk tools the Staff tab links, those the viewer's role can open.
  desk: StaffSection[];
  // The club's date (YYYY-MM-DD), the latest Birth Date the field takes.
  today: string;
  challengeDms: ChallengeDmsData | null;
}

// /settings: the SETTINGS headline over the page's tabs (see SettingsTabs),
// each tab's state line read from the same data its panel shows. The action
// behind every switch refreshes the page, so a line follows its switch once
// the save lands.
export function SettingsView(p: SettingsViewProps) {
  const challengesHidden = p.prefs?.features.some((f) => f.key === "challenges" && f.hidden) === true;
  const panels: Record<SettingsTab, Omit<SettingsTabItem, "key">> = {
    you: {
      note: youTabNote(p.birthDate),
      panel: <YouTab birthDate={p.birthDate} staff={p.staff} today={p.today} />,
    },
    features: {
      note: featuresTabNote(p.prefs),
      panel: <FeaturesTab prefs={p.prefs} newsCategories={p.newsCategories} hiddenPlatforms={p.hiddenPlatforms} />,
    },
    notifications: {
      note: notificationsTabNote(p.challengeDms ? (p.challengeDms.settings?.dms ?? null) : undefined),
      panel: <NotificationsTab challengeDms={p.challengeDms} challengesHidden={challengesHidden} />,
    },
    layout: {
      note: layoutTabNote(p.pinsCustomised, p.panelsCustomised),
      panel: (
        <LayoutTab pinsCustomised={p.pinsCustomised} pinsDefault={p.pinsDefault} panelsCustomised={p.panelsCustomised} />
      ),
    },
    staff: {
      note: staffTabNote(p.prefs?.show_preview_features),
      panel: <StaffTab prefs={p.prefs} desk={p.desk} />,
    },
  };

  return (
    <div className="flex max-w-6xl flex-col gap-6">
      <PageHeader title="Settings" />
      <SettingsTabs initial={p.tab} tabs={settingsTabsFor(p.staff).map((key) => ({ key, ...panels[key] }))} />
    </div>
  );
}
