import { describe, expect, it } from "vitest";

import { runsTimeline } from "@/lib/challenges/slots-timeline";
import type { ChallengeRun } from "@/lib/challenges/types";

const TODAY = "2026-11-17";

const run = (
  id: number,
  userId: string,
  first: number,
  filled: number[],
  over: Partial<ChallengeRun> = {},
): ChallengeRun => {
  const years = Array.from({ length: 2026 - first + 1 }, (_, i) => first + i);
  return {
    id,
    challenge: { id: 3, name: "Years Alive", challenge_format: "slots", schedule: "always_open" },
    user: { user_id: userId, username: `member${userId}`, global_name: `Member ${userId}` },
    status: "active",
    started_at: "2026-01-01T15:00:00Z",
    window: { starts_on: "2026-01-01", ends_on: null },
    progress: { cleared: filled.length, in_progress: 0, target: years.length, caught_up: filled.length === years.length },
    entries: [],
    slots: { first_year: first, last_year: 2026, growing: true, years: years.map((year) => ({ year, game_id: filled.includes(year) ? year : null })) },
    ...over,
  };
};

const all = (from: number) => Array.from({ length: 2026 - from + 1 }, (_, i) => from + i);

describe("runsTimeline", () => {
  const runs = [
    run(1, "100", 2018, [2018]), // the viewer
    run(2, "200", 2020, [2020, 2021]),
    run(3, "300", 2022, all(2022)),
    run(4, "400", 2016, [2016, 2017, 2018, 2019, 2020]),
  ];

  it("leaves the viewer's own Run out", () => {
    expect(runsTimeline(runs, "100", TODAY).lanes.map((l) => l.userId)).not.toContain("100");
  });

  it("shares one axis from the earliest first year to this year, labelled every 5 years", () => {
    const t = runsTimeline(runs, "100", TODAY);
    expect([t.start, t.end]).toEqual([2016, 2026]);
    expect(t.labels).toEqual([
      { year: 2020, index: 4 },
      { year: 2025, index: 9 },
    ]);
  });

  it("gives each lane a cell per year: Cleared, open, or nothing before its first year", () => {
    const lane = runsTimeline(runs, "100", TODAY).lanes.find((l) => l.userId === "200")!;
    expect(lane.cells.slice(0, 6)).toEqual(["none", "none", "none", "none", "cleared", "cleared"]);
    expect(lane.cells.at(-1)).toBe("open");
    expect(lane.firstIndex).toBe(4);
    expect(lane.firstYear).toBe(2020);
  });

  it("puts Caught Up and Finished Runs first, then by the share Cleared", () => {
    const t = runsTimeline(runs, "100", TODAY);
    expect(t.lanes.map((l) => l.userId)).toEqual(["300", "400", "200"]);
    expect(t.lanes[0]).toMatchObject({ caughtUp: true, cleared: 5, target: 5, name: "Member 300" });
  });

  it("shows one Run per member: the Active one, else the newest", () => {
    const again = [
      run(5, "200", 2020, [], { status: "abandoned", started_at: "2025-01-01T00:00:00Z" }),
      run(2, "200", 2020, [2020]),
    ];
    expect(runsTimeline(again, "100", TODAY).lanes.map((l) => l.runId)).toEqual([2]);
  });

  it("marks an open year an In Progress game fits", () => {
    const playing = run(6, "500", 2024, [2024], {
      entries: [{ game_id: 7, title: "Yakuza", state: "in_progress", picked_by_hand: false, release_years: [2020, 2025] }],
    });
    expect(runsTimeline([playing], "100", TODAY).lanes[0].cells).toEqual(["cleared", "fits", "open"]);
  });
});
