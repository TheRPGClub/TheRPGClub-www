import { describe, expect, it } from "vitest";
import type { BirthDate } from "@/lib/birth-date";
import type { FeaturePreferences } from "@/lib/feature-preferences";
import {
  featuresTabNote,
  layoutTabNote,
  notificationsTabNote,
  parseSettingsTab,
  settingsTabHref,
  settingsTabsFor,
  staffTabNote,
  youTabNote,
} from "@/lib/settings-tabs";

describe("settings tabs", () => {
  it("gives staff the Staff tab and members the rest", () => {
    expect(settingsTabsFor(false)).toEqual(["you", "features", "notifications", "layout"]);
    expect(settingsTabsFor(true)).toEqual(["you", "features", "notifications", "layout", "staff"]);
  });

  it("reads ?tab= leniently, defaulting to Features", () => {
    expect(parseSettingsTab("you", false)).toBe("you");
    expect(parseSettingsTab(["layout", "you"], false)).toBe("layout");
    expect(parseSettingsTab(undefined, false)).toBe("features");
    expect(parseSettingsTab("nope", true)).toBe("features");
    expect(parseSettingsTab("staff", false)).toBe("features");
    expect(parseSettingsTab("staff", true)).toBe("staff");
  });

  it("drops the parameter for the default tab", () => {
    expect(settingsTabHref("features")).toBe("/settings");
    expect(settingsTabHref("notifications")).toBe("/settings?tab=notifications");
  });
});

describe("tab notes", () => {
  const bd = (over: Partial<BirthDate>): BirthDate => ({
    user_id: "1",
    birth_date: "1988-03-15",
    birthday_shared: true,
    changes_left_this_month: 2,
    next_change_on: null,
    ...over,
  });

  it("You: the day and whether it's shared", () => {
    expect(youTabNote(bd({}))).toBe("15 Mar · shared");
    expect(youTabNote(bd({ birth_date: "12-01", birthday_shared: false }))).toBe("1 Dec · private");
    expect(youTabNote(bd({ birth_date: null, birthday_shared: false }))).toBe("No date yet");
    expect(youTabNote(null)).toBe("");
  });

  it("Features: shown of hideable", () => {
    const feature = (hidden: boolean) => ({ key: "k", name: "K", state: "live" as const, preview: false, hidden, website: [] });
    const prefs = (features: FeaturePreferences["features"]): FeaturePreferences => ({
      user_id: "1",
      hidden: [],
      show_preview_features: null,
      features,
    });
    expect(featuresTabNote(prefs([feature(false), feature(true), feature(false)]))).toBe("2 of 3 shown");
    expect(featuresTabNote(prefs([]))).toBe("");
    expect(featuresTabNote(null)).toBe("");
  });

  it("Notifications, Your layout and Staff", () => {
    expect(notificationsTabNote(true)).toBe("DMs on");
    expect(notificationsTabNote(false)).toBe("DMs off");
    expect(notificationsTabNote(undefined)).toBe("None");
    expect(notificationsTabNote(null)).toBe("");
    expect(layoutTabNote(true, true)).toBe("Your own pins and panels");
    expect(layoutTabNote(false, true)).toBe("Your own panels");
    expect(layoutTabNote(false, false)).toBe("The club's");
    expect(staffTabNote(true)).toBe("Preview on");
    expect(staffTabNote(null)).toBe("The desk");
  });
});
