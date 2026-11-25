import { describe, expect, it } from "vitest";

import type { GameCompletion, Platform } from "@/lib/api/types";
import type { GamePlaytime } from "./types";
import {
  changePreview,
  defaultPlatform,
  earlierPlaythroughs,
  hasPlaytime,
  hoursText,
  manualMinutesOn,
  mismatchView,
  parseHours,
  platformChoices,
  platformShort,
  playthroughHours,
  playthroughView,
  playtimeChip,
  sourceRows,
} from "./view";

const h = (hours: number) => hours * 60;

// Mara's Final Fantasy VI, as in the 2D+F mock: Steam, RetroAchievements
// and PSN, Manual Switch and PS4, PSN and the Manual PS4 entry mismatched.
const FF6: GamePlaytime = {
  user_id: "u1",
  game_id: 42,
  total_minutes: h(180),
  breakdown: {
    provider_sets: [
      { achievement_set_id: 3, provider: "psn", title: "Final Fantasy VI", platform_label: "PS4", platform_id: 48, platform_name: "PS4", minutes: h(29), counted: true },
      { achievement_set_id: 2, provider: "retroachievements", title: "Final Fantasy III (US)", platform_label: "SNES", platform_id: 19, platform_name: "SNES", minutes: h(48), counted: true },
      { achievement_set_id: 1, provider: "steam", title: "Pixel Remaster", platform_label: "PC", platform_id: 6, platform_name: "PC", minutes: h(42), counted: true },
    ],
    manual_entries: [
      { id: 11, platform_id: 130, platform_name: "Switch", minutes: h(30), note: "From my save file", origin: "member", keeps_over_provider: null, created_at: "2026-11-01T10:00:00Z", updated_at: "2026-11-02T18:00:00Z" },
      { id: 12, platform_id: 48, platform_name: "PS4", minutes: h(31), note: "Old note from 2023", origin: "member", keeps_over_provider: null, created_at: "2024-03-14T10:00:00Z", updated_at: "2024-03-14T18:00:00Z" },
    ],
  },
  mismatches: [{ platform_id: 48, platform_name: "PS4", provider: "psn", provider_minutes: h(29), manual_playtime_id: 12, manual_minutes: h(31) }],
  playthrough: { id: 7, started_at: "2026-11-09T18:12:00Z", minutes: 860, baseline_minutes: 166 * 60 - 20, manual: false },
  playthroughs: [
    { id: 5, started_at: "2019-01-20T10:00:00Z", ended_at: "2019-03-14T16:00:00Z", end_reason: "completed", minutes: h(38), manual: false, completion_id: 5 },
    { id: 6, started_at: "2025-10-01T10:00:00Z", ended_at: "2025-11-02T16:00:00Z", end_reason: "abandoned", minutes: h(6), manual: false, completion_id: null },
  ],
};

const EMPTY: GamePlaytime = { ...FF6, total_minutes: 0, breakdown: { provider_sets: [], manual_entries: [] }, mismatches: [], playthrough: null, playthroughs: [] };

describe("hours", () => {
  it("writes whole hours from 10 h, tenths below, minutes under an hour", () => {
    expect(hoursText(h(180))).toBe("180 h");
    expect(hoursText(h(1234))).toBe("1,234 h");
    expect(hoursText(390)).toBe("6.5 h");
    expect(hoursText(45)).toBe("45 m");
    expect(hoursText(0)).toBe("0 h");
  });

  it("reads typed hours as minutes", () => {
    expect(parseHours("3")).toBe(180);
    expect(parseHours(" 2.5 ")).toBe(150);
    expect(parseHours("1,5")).toBe(90);
    expect(parseHours("")).toBeNull();
    expect(parseHours("-1")).toBeNull();
    expect(parseHours("lots")).toBeNull();
  });
});

describe("the chip", () => {
  it("reads the total, the open Playthrough and a waiting mismatch", () => {
    expect(playtimeChip(FF6)).toEqual({
      total: "180 h",
      playthrough: "14 h",
      flagged: true,
      label: "Your Playtime: 180 h, Playthrough 14 h, 1 to check",
    });
  });

  it("is the total alone with no Playthrough open and nothing to check", () => {
    const chip = playtimeChip({ ...FF6, mismatches: [], playthrough: null });
    expect(chip).toMatchObject({ total: "180 h", playthrough: null, flagged: false });
  });

  it("has no Playtime with no source, even with a Playthrough open", () => {
    expect(hasPlaytime(EMPTY)).toBe(false);
    expect(hasPlaytime({ ...EMPTY, playthrough: FF6.playthrough })).toBe(false);
    expect(hasPlaytime(null)).toBe(false);
    expect(hasPlaytime(FF6)).toBe(true);
  });
});

describe("the breakdown", () => {
  it("lists Steam, RetroAchievements and PSN, then Manual by platform", () => {
    const rows = sourceRows(FF6);
    expect(rows.map((r) => `${r.source} ${r.platform} ${r.hours}`)).toEqual([
      "Steam PC 42 h",
      "RetroAchievements SNES 48 h",
      "PSN PS4 29 h",
      "Manual PS4 31 h",
      "Manual Switch 30 h",
    ]);
  });

  it("flags both sides of a waiting mismatch", () => {
    const flagged = sourceRows(FF6).filter((r) => r.flagged).map((r) => r.key);
    expect(flagged).toEqual(["set:3", "manual:12"]);
  });

  it("shows a Manual entry's note and when it was set, and its id", () => {
    const row = sourceRows(FF6).find((r) => r.key === "manual:11")!;
    expect(row).toMatchObject({ kind: "manual", detail: "“From my save file”", meta: "set 2 Nov", manualId: 11, platformId: 130 });
  });

  it("names a Manual entry with no platform Other, and an unresolved Provider label raw", () => {
    const doc: GamePlaytime = {
      ...EMPTY,
      breakdown: {
        provider_sets: [{ achievement_set_id: 9, provider: "psn", title: null, platform_label: "PS5,PS4", platform_id: null, platform_name: null, minutes: 60, counted: true }],
        manual_entries: [{ id: 1, platform_id: null, platform_name: null, minutes: 120, note: null, origin: "completion_seed", created_at: "2026-11-25T10:00:00Z", updated_at: "2026-11-25T10:00:00Z" }],
      },
    };
    expect(sourceRows(doc).map((r) => r.platform)).toEqual(["PS5,PS4", "Other"]);
  });

  it("marks a Provider figure the member kept theirs over as not counted", () => {
    const doc: GamePlaytime = {
      ...FF6,
      mismatches: [],
      breakdown: { ...FF6.breakdown, provider_sets: FF6.breakdown.provider_sets.map((s) => (s.provider === "psn" ? { ...s, counted: false } : s)) },
    };
    const psn = sourceRows(doc).find((r) => r.key === "set:3")!;
    expect(psn).toMatchObject({ counted: false, flagged: false, meta: "not counted: you kept yours" });
  });
});

describe("short platform labels", () => {
  it("uses the club's abbreviation over the API's name", () => {
    const short = platformShort([{ platform_id: 48, platform_code: "ps4", platform_name: "PlayStation 4", platform_abbreviation: "PS4", igdb_platform_id: 48 }]);
    const doc = { ...FF6, breakdown: { ...FF6.breakdown, manual_entries: [{ ...FF6.breakdown.manual_entries[1], platform_name: "PlayStation 4" }] } };
    expect(sourceRows(doc, short).at(-1)?.platform).toBe("PS4");
    expect(mismatchView({ ...FF6.mismatches[0], platform_name: "PlayStation 4" }, short).detail).toBe("Both count, so PS4 may be in twice.");
  });
});

describe("a mismatch", () => {
  it("says what each side reports and offers both keeps", () => {
    expect(mismatchView(FF6.mismatches[0])).toEqual({
      key: "psn:48",
      platformId: 48,
      headline: "PSN now reports 29 h on PS4; your manual PS4 entry says 31 h.",
      detail: "Both count, so PS4 may be in twice.",
      keepProvider: "Keep PSN's 29 h",
      keepMine: "Keep my 31 h",
    });
  });
});

describe("Add Playtime", () => {
  it("previews the change Add time and Set total make", () => {
    expect(changePreview(h(30), "add", "3")).toBe("30 h to 33 h");
    expect(changePreview(h(30), "set", "45")).toBe("30 h to 45 h");
    expect(changePreview(h(30), "add", "")).toBeNull();
  });

  it("defaults to the platform last added to, else Now Playing's, else Other", () => {
    expect(defaultPlatform(FF6, 6)).toBe(130);
    expect(defaultPlatform(EMPTY, 6)).toBe(6);
    expect(defaultPlatform(EMPTY, null)).toBeNull();
  });

  it("puts the member's Manual platforms first, then the rest, then Other", () => {
    const platforms = [
      { platform_id: 6, platform_code: "pc", platform_name: "PC", platform_abbreviation: "PC", igdb_platform_id: 6 },
      { platform_id: 130, platform_code: "switch", platform_name: "Switch", platform_abbreviation: "NSW", igdb_platform_id: 130 },
      { platform_id: 48, platform_code: "ps4", platform_name: "PS4", platform_abbreviation: "PS4", igdb_platform_id: 48 },
    ] satisfies Platform[];
    expect(platformChoices(FF6, platforms).map((c) => c.label)).toEqual([
      "Switch · your Manual Playtime, 30 h",
      "PS4 · your Manual Playtime, 31 h",
      "PC",
      "Other",
    ]);
    expect(manualMinutesOn(FF6, 130)).toBe(h(30));
    expect(manualMinutesOn(FF6, 6)).toBe(0);
  });
});

describe("the Playthrough card", () => {
  it("reads the clock, where it started and what it counts from", () => {
    expect(playthroughView(FF6, "2026-11-09T20:00:00Z")).toEqual({
      id: 7,
      clock: { h: 14, m: 20 },
      since: "9 Nov",
      fromNowPlaying: true,
      countedFrom: "166 h",
      manual: false,
      minutes: 860,
    });
  });

  it("counts from the Playthrough's baseline, even when Playtime fell below it", () => {
    const fell = { ...FF6, total_minutes: h(100), playthrough: { ...FF6.playthrough!, minutes: 0, baseline_minutes: h(150) } };
    expect(playthroughView(fell)).toMatchObject({ countedFrom: "150 h", clock: { h: 0, m: 0 } });
  });

  it("counts from nothing for a total set by hand, and is null with none open", () => {
    expect(playthroughView({ ...FF6, playthrough: { ...FF6.playthrough!, manual: true } })).toMatchObject({ countedFrom: null, manual: true, fromNowPlaying: false });
    expect(playthroughView(EMPTY)).toBeNull();
  });

  it("lists the earlier ones with how they ended", () => {
    const completions = [{ completion_id: 5, completion_type: "Main Story" }] as GameCompletion[];
    expect(earlierPlaythroughs(FF6, completions)).toEqual([
      { id: 5, label: "Mar 2019 · Main Story", hours: "38 h" },
      { id: 6, label: "Nov 2025 · Abandoned", hours: "6 h" },
    ]);
  });

  it("gives the completion form its hours", () => {
    expect(playthroughHours(860)).toBe("14.33");
    expect(playthroughHours(null)).toBe("");
    expect(playthroughHours(0)).toBe("");
  });
});
