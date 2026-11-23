// /settings' tabs (design pick "C, big type", 2026-11-23): You, Features,
// Notifications, Your layout and, for staff, Staff. Each tab carries a short
// state line under its name, read from the page's data, so a member sees
// what is in a tab without opening it. The tab is kept in the URL
// (`?tab=you`); Features, the page's old content, is the default and has no
// parameter. Client-safe: no server imports.

import type { BirthDate } from "@/lib/birth-date";
import type { FeaturePreferences } from "@/lib/feature-preferences";

export const SETTINGS_TABS = ["you", "features", "notifications", "layout", "staff"] as const;
export type SettingsTab = (typeof SETTINGS_TABS)[number];

export const DEFAULT_SETTINGS_TAB: SettingsTab = "features";

export const SETTINGS_TAB_LABELS: Record<SettingsTab, string> = {
  you: "You",
  features: "Features",
  notifications: "Notifications",
  layout: "Your layout",
  staff: "Staff",
};

// The tabs this viewer gets, in order: Staff only for staff.
export function settingsTabsFor(staff: boolean): SettingsTab[] {
  return SETTINGS_TABS.filter((t) => t !== "staff" || staff);
}

// `?tab=` read leniently: anything unknown, or Staff for a member, opens the
// default tab rather than an error.
export function parseSettingsTab(raw: unknown, staff: boolean): SettingsTab {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return settingsTabsFor(staff).find((t) => t === value) ?? DEFAULT_SETTINGS_TAB;
}

// The URL for a tab, kept by replacing the history entry as tabs change.
export function settingsTabHref(tab: SettingsTab): string {
  return tab === DEFAULT_SETTINGS_TAB ? "/settings" : `/settings?tab=${tab}`;
}

const SHORT_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// "15 Mar · shared", "15 Mar · private", "No date yet". Empty when the read
// failed: the tab says nothing rather than guess.
export function youTabNote(birthDate: BirthDate | null): string {
  if (!birthDate) return "";
  if (!birthDate.birth_date) return "No date yet";
  const [month, day] = birthDate.birth_date.split("-").slice(-2).map(Number);
  return `${day} ${SHORT_MONTHS[month - 1]} · ${birthDate.birthday_shared ? "shared" : "private"}`;
}

// "7 of 9 shown"; empty with nothing to hide or when the read failed.
export function featuresTabNote(prefs: FeaturePreferences | null): string {
  if (!prefs || prefs.features.length === 0) return "";
  const shown = prefs.features.filter((f) => !f.hidden).length;
  return `${shown} of ${prefs.features.length} shown`;
}

// "DMs on" / "DMs off"; "None" when no DM can be chosen (Challenges isn't
// shown to the member); empty when the read failed.
export function notificationsTabNote(dms: boolean | null | undefined): string {
  if (dms === undefined) return "None";
  if (dms === null) return "";
  return dms ? "DMs on" : "DMs off";
}

// Whose Pinned Pages and Dashboard Panels the member follows.
export function layoutTabNote(pins: boolean, panels: boolean): string {
  if (pins && panels) return "Your own pins and panels";
  if (pins) return "Your own pins";
  if (panels) return "Your own panels";
  return "The club's";
}

// "Preview on" / "Preview off" for Admins and up; "The desk" for a
// Moderator, who has no Preview switch, only the desk links.
export function staffTabNote(showPreview: boolean | null | undefined): string {
  if (showPreview == null) return "The desk";
  return showPreview ? "Preview on" : "Preview off";
}
