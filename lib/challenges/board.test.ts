import { describe, expect, it } from "vitest";

import {
  applyFilters,
  arrangeBoard,
  billboardClock,
  boardHref,
  countLine,
  emptyFilterLine,
  parseBoardFilters,
  slotSquares,
  viewerRuns,
  yourRunLine,
} from "@/lib/challenges/board";
import type { Challenge, ChallengeRun } from "@/lib/challenges/types";

const TODAY = "2026-11-17";

const challenge = (id: number, over: Partial<Challenge> = {}): Challenge =>
  ({
    id,
    name: `Challenge ${id}`,
    description: "",
    challenge_format: "pool",
    hosted_by_club: false,
    schedule: "always_open",
    open: true,
    hidden: false,
    created_at: "",
    updated_at: "",
    ...over,
  }) as Challenge;

const autumn = { start: "09-22", end: "12-20", crosses_new_year: false };
const winter = { start: "12-01", end: "02-28", crosses_new_year: true };
const summer = { start: "06-21", end: "09-22", crosses_new_year: false };

describe("filters", () => {
  it("reads the address and ignores what it doesn't know", () => {
    expect(parseBoardFilters({ open: "closed", format: "pool" })).toEqual({
      open: "closed",
      format: "pool",
    });
    expect(parseBoardFilters({ open: "soon", format: "quest" })).toEqual({
      open: "all",
      format: null,
    });
  });

  it("writes the address with only what is set", () => {
    expect(boardHref({ open: "all", format: null }, { format: "slots" })).toBe("/challenges?format=slots");
    expect(boardHref({ open: "open", format: "slots" }, { format: null })).toBe("/challenges?open=open");
  });

  it("filters by Open and Format, and says what found nothing", () => {
    const list = [challenge(1), challenge(2, { open: false }), challenge(3, { challenge_format: "slots" })];
    expect(applyFilters(list, { open: "closed", format: null }).map((c) => c.id)).toEqual([2]);
    expect(applyFilters(list, { open: "all", format: "slots" }).map((c) => c.id)).toEqual([3]);
    expect(emptyFilterLine({ open: "closed", format: "pool" })).toBe("No Closed Pool Challenges.");
    expect(countLine(list)).toBe("2 Open · 1 Closed");
  });
});

describe("billboards", () => {
  it("counts down a Season and an Edition's sign-up or picking", () => {
    expect(billboardClock(challenge(1, { schedule: "seasonal", season: autumn }), TODAY)).toEqual({
      days: 34,
      caption: "days left",
    });
    const santa = challenge(2, {
      challenge_format: "assignment",
      assignment: {
        signup_cutoff: "12-01",
        pick_deadline: "12-15",
        reveal: "12-25",
        edition: {
          phase: "signup",
          signup_cutoff_on: "2026-12-01",
          pick_deadline_on: "2026-12-15",
        } as never,
      },
    });
    expect(billboardClock(santa, TODAY)).toEqual({
      days: 14,
      caption: "days to sign up",
    });
    expect(billboardClock(challenge(3), TODAY)).toBeNull();
  });

  it("pastes up at most two running Challenges, nearest deadline first", () => {
    const list = [
      challenge(1, { schedule: "seasonal", season: autumn }),
      challenge(2, {
        schedule: "seasonal",
        season: { start: "11-01", end: "11-30", crosses_new_year: false },
      }),
      challenge(3, {
        schedule: "seasonal",
        season: { start: "10-01", end: "12-31", crosses_new_year: false },
      }),
      challenge(4),
    ];
    const board = arrangeBoard(list, TODAY);
    expect(board.billboards.map((c) => c.id)).toEqual([2, 1]);
    expect(board.flyers.map((c) => c.id)).toEqual([4, 3]);
  });

  it("puts Open flyers first by Runs, then Closed ones soonest to open", () => {
    const list = [
      challenge(1, { open: false, schedule: "seasonal", season: summer }),
      challenge(2, { open: false, schedule: "seasonal", season: winter }),
      challenge(3),
      challenge(4),
      challenge(5, { open: false, ends_on: "2026-03-01" }),
    ];
    const board = arrangeBoard(
      list,
      TODAY,
      new Map([
        [3, 2],
        [4, 9],
      ]),
    );
    expect(board.billboards).toEqual([]);
    expect(board.flyers.map((c) => c.id)).toEqual([4, 3, 2, 1, 5]);
  });
});

describe("the viewer's Runs", () => {
  const run = (id: number, challengeId: number, status: ChallengeRun["status"], started_at: string) =>
    ({
      id,
      challenge: { id: challengeId },
      status,
      started_at,
      progress: { cleared: 35, target: 39, in_progress: 1 },
    }) as ChallengeRun;

  it("keeps their newest Active or Finished Run of each Challenge", () => {
    const runs = viewerRuns([
      run(1, 10, "finished", "2025-10-01T00:00:00Z"),
      run(2, 10, "active", "2026-10-01T00:00:00Z"),
      run(3, 11, "abandoned", "2026-10-01T00:00:00Z"),
    ]);
    expect([...runs.keys()]).toEqual([10]);
    expect(runs.get(10)?.id).toBe(2);
    expect(yourRunLine(runs.get(10)!)).toBe("Your Run · 35 of 39 Cleared");
  });
});

describe("slotSquares", () => {
  it("fills the viewer's Cleared years, with the years past twenty counted", () => {
    const years = Array.from({ length: 39 }, (_, i) => ({
      year: 1988 + i,
      game_id: i < 35 ? i : null,
    }));
    const run = {
      slots: { first_year: 1988, last_year: 2026, growing: true, years },
    } as ChallengeRun;
    expect(slotSquares(challenge(1, { challenge_format: "slots" }), run, TODAY)).toMatchObject({ more: 19 });
    expect(slotSquares(challenge(1), run, TODAY).filled.every(Boolean)).toBe(true);
  });

  it("outlines a fixed range's years without a Run", () => {
    const c = challenge(1, {
      slots: { first_year: 1990, last_year: 1999, counts_past_play: false },
    });
    expect(slotSquares(c, undefined, TODAY)).toEqual({
      filled: Array(10).fill(false),
      more: 0,
    });
  });
});
