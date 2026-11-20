import { describe, expect, it } from "vitest";

import {
  ageLabel,
  dayAgeLabel,
  eventAge,
  eventSentence,
  releaseDateBlock,
  releasePlatforms,
  suggestionActivity,
} from "@/lib/dashboard/panel-items";
import type { ChallengeEvent } from "@/lib/dashboard/panel-sources";

const NOW = Date.parse("2026-11-20T12:00:00Z");

describe("ageLabel", () => {
  it("counts minutes, hours and days, then names the day", () => {
    expect(ageLabel("2026-11-20T11:59:30Z", NOW)).toBe("now");
    expect(ageLabel("2026-11-20T11:55:00Z", NOW)).toBe("5m");
    expect(ageLabel("2026-11-20T10:00:00Z", NOW)).toBe("2h");
    expect(ageLabel("2026-11-17T12:00:00Z", NOW)).toBe("3d");
    expect(ageLabel("2026-11-02T08:00:00Z", NOW)).toBe("2 Nov");
  });

  it("reads a time ahead of the clock as now, and nothing for garbage", () => {
    expect(ageLabel("2026-11-20T13:00:00Z", NOW)).toBe("now");
    expect(ageLabel("soon", NOW)).toBe("");
  });
});

describe("dayAgeLabel", () => {
  it("says Today, then days, then the day", () => {
    expect(dayAgeLabel("2026-11-20", "2026-11-20")).toBe("Today");
    expect(dayAgeLabel("2026-11-18", "2026-11-20")).toBe("2d");
    expect(dayAgeLabel("2026-11-01", "2026-11-20")).toBe("1 Nov");
  });
});

describe("eventAge", () => {
  it("uses the time when the event has one, else its club day", () => {
    expect(eventAge({ occurred_at: "2026-11-20T10:00:00Z", occurred_on: "2026-11-20" }, NOW, "2026-11-20")).toBe("2h");
    expect(eventAge({ occurred_at: null, occurred_on: "2026-11-19" }, NOW, "2026-11-20")).toBe("1d");
  });
});

describe("releaseDateBlock", () => {
  it("prints an exact day as its number over the month and weekday", () => {
    expect(releaseDateBlock({ date: "2026-11-26", date_precision: "day" })).toEqual({ big: "26", small: "Nov · Thu", vague: false });
  });

  it("prints a vague date as what is known over what isn't", () => {
    expect(releaseDateBlock({ date: "2026-12-01", date_precision: "month" })).toEqual({ big: "Dec", small: "Day TBA", vague: true });
    expect(releaseDateBlock({ date: "2027-07-01", date_precision: "quarter" })).toMatchObject({ big: "Q3", small: "Month TBA" });
    expect(releaseDateBlock({ date: null, date_precision: "tba" })).toEqual({ big: "TBA", small: "No date yet", vague: true });
  });
});

describe("releasePlatforms", () => {
  it("names each platform once, short names first", () => {
    const r = (platform_name: string, platform_abbreviation: string | null) => ({ platform_name, platform_abbreviation }) as never;
    expect(releasePlatforms({ releases: [r("PlayStation 5", "PS5"), r("PlayStation 5", "PS5"), r("PC (Windows)", null)] })).toBe(
      "PS5 · PC (Windows)",
    );
  });
});

describe("eventSentence", () => {
  const event = (extra: Partial<ChallengeEvent>): ChallengeEvent => ({
    kind: "run_started",
    occurred_on: "2026-11-20",
    occurred_at: null,
    challenge: { id: 1, name: "Secret Santa", challenge_format: "assignment" },
    user: { user_id: "1", username: "mara", global_name: "Mara" },
    game: null,
    run_id: 1,
    edition: null,
    ...extra,
  });
  const text = (e: ChallengeEvent) => eventSentence(e).map((p) => (p.strong ? `*${p.text}*` : p.text)).join("");

  it("names the member and what they did", () => {
    expect(text(event({}))).toBe("*Mara* started a Run");
    expect(text(event({ kind: "game_cleared", game: { game_id: 3, title: "Hades II" } }))).toBe("*Mara* cleared *Hades II*");
    expect(text(event({ kind: "run_finished", user: { user_id: "2", username: "kes" } }))).toBe("*kes* finished their Run");
  });

  it("names the Edition for its sign-ups and reveal", () => {
    const edition = { id: 4, year: 2026 };
    expect(text(event({ kind: "signups_opened", user: null, edition }))).toBe("Sign-ups opened for *Secret Santa 2026*");
    expect(text(event({ kind: "edition_revealed", user: null, edition }))).toBe("Gifts revealed for *Secret Santa 2026*");
  });
});

describe("suggestionActivity", () => {
  const s = { created_at: "2026-11-01T00:00:00Z", reviewed_at: null, status: "pending" as const };

  it("tells a submission, a review, an upvote and a withdrawal apart", () => {
    expect(suggestionActivity({ ...s, last_activity_at: "2026-11-01T00:00:00Z" })).toBe("submitted");
    expect(suggestionActivity({ ...s, last_activity_at: "2026-11-03T00:00:00Z" })).toBe("upvoted");
    expect(
      suggestionActivity({ ...s, status: "approved", reviewed_at: "2026-11-02T00:00:00Z", last_activity_at: "2026-11-02T00:00:00Z" }),
    ).toBe("approved");
    expect(suggestionActivity({ ...s, status: "withdrawn", last_activity_at: "2026-11-05T00:00:00Z" })).toBe("withdrawn");
  });

  it("reads an API without the activity time as the submission", () => {
    expect(suggestionActivity(s)).toBe("submitted");
  });
});
