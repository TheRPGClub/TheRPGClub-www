import { describe, expect, it } from "vitest";

import { profileRuns, stampTilt } from "@/lib/challenges/profile-runs";
import type { ChallengeRun } from "@/lib/challenges/types";

const today = "2026-11-17";

const run = (id: number, over: Partial<ChallengeRun> = {}): ChallengeRun =>
  ({
    id,
    challenge: { id: 1, name: "Fall of Final Fantasy", challenge_format: "pool", schedule: "seasonal" },
    user: { user_id: "u1", username: "slayer" },
    status: "active",
    started_at: "2026-09-23T14:00:00Z",
    window: { starts_on: "2026-09-22", ends_on: "2026-12-20" },
    progress: { in_progress: 1, cleared: 2, target: 3 },
    entries: [],
    ...over,
  }) as ChallengeRun;

const slots = run(2, {
  challenge: { id: 2, name: "Years Alive", challenge_format: "slots", schedule: "always_open" },
  window: { starts_on: "2026-01-04", ends_on: null },
  started_at: "2026-01-04T10:00:00Z",
  progress: { in_progress: 1, cleared: 35, target: 39, caught_up: false },
  slots: { first_year: 1988, last_year: 2026, growing: true },
  entries: [{ game_id: 40, title: "Yakuza: Like a Dragon", state: "in_progress", picked_by_hand: false }],
});

const santa = run(3, {
  challenge: { id: 3, name: "Secret Santa", challenge_format: "assignment", schedule: "always_open" },
  edition: { id: 1, year: 2025 },
  window: { starts_on: "2025-12-25", ends_on: "2026-12-24" },
  progress: { in_progress: 0, cleared: 0, target: 1 },
  assignment: { game: { game_id: 50, title: "Lost Odyssey", cover_url: "https://x/lo.jpg" } as never },
});

describe("profileRuns", () => {
  it("puts Active Runs on top, nearest deadline first, and counts the rest as past", () => {
    const past = run(9, { status: "finished", ended_at: "2026-08-30T15:00:00Z" });
    const view = profileRuns([slots, santa, run(1), past], today);
    expect(view.current.map((s) => s.id)).toEqual([1, 3, 2]);
    expect(view.past.map((s) => s.id)).toEqual([9]);
    expect(view.countLine).toBe("3 current · 1 past");
    expect(view.finished).toBe(1);
  });

  it("orders Always Open Runs without an end by their latest play", () => {
    const quiet = run(4, { ...slots, id: 4, started_at: "2025-03-01T10:00:00Z", entries: [] });
    const busy = run(5, {
      ...slots,
      id: 5,
      started_at: "2025-01-01T10:00:00Z",
      entries: [{ game_id: 1, title: "A", state: "cleared", cleared_on: "2026-11-10", picked_by_hand: false }],
    });
    expect(profileRuns([quiet, busy], today).current.map((s) => s.id)).toEqual([5, 4]);
  });

  it("lists past Runs newest outcome first", () => {
    const older = run(6, { status: "expired", ended_at: "2025-09-22T04:00:00Z" });
    const newer = run(7, { status: "abandoned", ended_at: "2026-03-02T15:00:00Z" });
    expect(profileRuns([older, newer], today).past.map((s) => s.id)).toEqual([7, 6]);
  });

  it("writes the when-line each Format and schedule prints", () => {
    const [pool, gift, years] = profileRuns([run(1), santa, slots], today).current;
    expect(pool.whenLine).toBe("Season 2026 · 34 days left");
    expect(gift.whenLine).toBe("Edition 2025 · until 24 Dec · 38 days left");
    expect(years.whenLine).toBe("from 1988 · Always Open");
  });

  it("shows the In Progress game or the assigned one beside the score", () => {
    const [, gift, years] = profileRuns([run(1), santa, slots], today).current;
    expect(years.cover).toEqual({ gameId: 40, title: "Yakuza: Like a Dragon", coverUrl: null, label: "In Progress" });
    expect(gift.cover).toEqual({ gameId: 50, title: "Lost Odyssey", coverUrl: "https://x/lo.jpg", label: "Assigned" });
  });

  it("keeps the assigned game off the stamp until the Edition's reveal, even when staff are served it", () => {
    const drawn = run(8, {
      ...santa,
      id: 8,
      edition: { id: 2, year: 2026 },
      window: { starts_on: "2026-12-25", ends_on: "2027-12-24" },
    });
    expect(profileRuns([drawn], today).current[0].cover).toBeNull();
    expect(profileRuns([drawn], "2026-12-25").current[0].cover?.title).toBe("Lost Odyssey");
  });

  it("keeps the gift hidden on a Run that ended before the reveal", () => {
    const left = run(8, {
      ...santa,
      id: 8,
      status: "abandoned",
      ended_at: "2026-12-05T15:00:00Z",
      window: { starts_on: "2026-12-25", ends_on: "2027-12-24" },
    });
    expect(profileRuns([left], today).past[0].cover).toBeNull();
  });

  it("gives Slots the score only and other Formats a bar", () => {
    const [pool, , years] = profileRuns([run(1), santa, slots], today).current;
    expect(years.segments).toBeNull();
    expect(pool.segments).toEqual([true, true, false]);
  });

  it("labels a past stamp with its Format, its Season or Edition, and its outcome date", () => {
    const done = run(9, { status: "finished", ended_at: "2026-08-30T15:00:00Z" });
    const gift = { ...santa, status: "finished" as const, ended_at: "2025-06-09T15:00:00Z" };
    const [pool, assigned] = profileRuns([done, gift], today).past;
    expect(pool.formatLine).toBe("Pool · Season 2026");
    expect(pool.outcomeLine).toBe("Finished 30 Aug 2026");
    expect(assigned.formatLine).toBe("Assignment · Edition 2025");
  });

  it("takes the tint the Run's Challenge carries, else its curated one", () => {
    const stored = { fill: "#123456", hi: "#abcdef" };
    const tinted = run(1, { challenge: { ...run(1).challenge, tint: stored } });
    const view = profileRuns([tinted, santa], today);
    expect(view.current.map((s) => s.tint)).toEqual([stored, { fill: "#1c6545", hi: "#3fbf8a" }]);
  });

  it("marks a Slots Run that is Caught Up", () => {
    const caught = { ...slots, progress: { ...slots.progress, caught_up: true } };
    expect(profileRuns([caught], today).current[0].caughtUp).toBe(true);
  });
});

describe("profileRuns with sign-ups", () => {
  const signup = {
    edition_id: 4,
    year: 2026,
    phase: "signup" as const,
    challenge: { id: 3, name: "Secret Santa" },
    signed_up_at: "2026-11-02T10:00:00Z",
    signup_cutoff_on: "2026-12-01",
    pick_deadline_on: "2026-12-15",
    reveal_on: "2026-12-25",
  };

  it("sets a sign-up among the current stamps by its draw day", () => {
    const view = profileRuns([run(1), slots], today, [signup]);
    expect(view.current.map((s) => s.key)).toEqual(["signup-4", "run-1", "run-2"]);
    expect(view.countLine).toBe("2 current · 1 signed up · 0 past");
  });

  it("says when the draw is", () => {
    const [stamp] = profileRuns([], today, [signup]).current;
    expect(stamp).toMatchObject({
      signedUp: true,
      name: "Secret Santa",
      format: "assignment",
      whenLine: "Edition 2026 · draw on 1 Dec · 14 days to go",
      tint: { fill: "#1c6545", hi: "#3fbf8a" },
    });
  });

  it("borrows the tint of another Run of the same Challenge", () => {
    const stored = { fill: "#123456", hi: "#abcdef" };
    const earlier = { ...santa, status: "finished" as const, challenge: { ...santa.challenge, tint: stored } };
    const [stamp] = profileRuns([earlier], today, [signup]).current;
    expect(stamp.tint).toEqual(stored);
  });
});

describe("stampTilt", () => {
  it("rests within ±1.3deg and is stable for a Run", () => {
    for (let id = 1; id < 40; id++) expect(Math.abs(stampTilt(id))).toBeLessThanOrEqual(1.3);
    expect(stampTilt(12)).toBe(stampTilt(12));
  });
});

// www#109: a Slots stamp opens the member's own years on the Challenge page.
describe("stamp links", () => {
  it("opens a Slots Run in the Challenge page's panel, any other Run on its Challenge page", () => {
    const { current } = profileRuns([run(1), slots], today);
    expect(current.find((s) => s.format === "slots")?.href).toBe("/challenges/2?run=u1#run");
    expect(current.find((s) => s.format === "pool")?.href).toBe("/challenges/1");
  });
});
