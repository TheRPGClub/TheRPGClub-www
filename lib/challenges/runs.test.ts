import { describe, expect, it } from "vitest";

import { initials, memberAvatar, runCardView, runSegments, seasonRuns, sortRuns } from "@/lib/challenges/runs";
import type { ChallengeRun } from "@/lib/challenges/types";

const run = (id: number, over: Partial<ChallengeRun> = {}): ChallengeRun =>
  ({
    id,
    challenge: {
      id: 1,
      name: "Fall of Final Fantasy",
      challenge_format: "pool",
      schedule: "seasonal",
    },
    user: { user_id: `u${id}`, username: `member${id}`, global_name: null },
    status: "active",
    started_at: "2026-09-23T14:00:00Z",
    window: { starts_on: "2026-09-22", ends_on: "2026-12-20" },
    progress: { in_progress: 0, cleared: 0, target: 3 },
    entries: [],
    ...over,
  }) as ChallengeRun;

describe("seasonRuns", () => {
  const seasonal = {
    schedule: "seasonal" as const,
    season: { start: "09-22", end: "12-20", crosses_new_year: false },
  };
  const runs = [run(1), run(2, { window: { starts_on: "2025-09-22" } })];

  it("shows the running Season's Runs", () => {
    expect(seasonRuns({ ...seasonal, open: true }, runs, "2026-11-17").map((r) => r.id)).toEqual([1]);
  });

  it("shows the last Season played while Closed", () => {
    expect(seasonRuns({ ...seasonal, open: false }, runs, "2027-01-17").map((r) => r.id)).toEqual([1]);
  });

  it("shows every Run of an Always Open Challenge", () => {
    expect(seasonRuns({ schedule: "always_open", season: null, open: true }, runs, "2026-11-17")).toHaveLength(2);
  });
});

describe("sortRuns", () => {
  it("lists who is ahead first and Abandoned Runs last", () => {
    const sorted = sortRuns([
      run(1, {
        status: "abandoned",
        progress: { cleared: 2, target: 3, in_progress: 0 },
      }),
      run(2, { progress: { cleared: 1, target: 3, in_progress: 1 } }),
      run(3, {
        status: "finished",
        ended_at: "2026-11-06T00:00:00Z",
        progress: { cleared: 4, target: 3, in_progress: 0 },
      }),
      run(4, {
        status: "finished",
        ended_at: "2026-11-02T00:00:00Z",
        progress: { cleared: 4, target: 3, in_progress: 0 },
      }),
    ]);
    expect(sorted.map((r) => r.id)).toEqual([4, 3, 2, 1]);
  });
});

describe("runCardView", () => {
  it("shapes a member's card with covers, segments and their dates", () => {
    const view = runCardView(
      run(7, {
        user: {
          user_id: "me",
          username: "backlog_slayer",
          global_name: "Backlog Slayer",
        },
        progress: { in_progress: 1, cleared: 2, target: 3 },
        entries: [
          {
            game_id: 10,
            title: "Final Fantasy X",
            state: "cleared",
            picked_by_hand: false,
          },
          {
            game_id: 11,
            title: "Final Fantasy XIII",
            state: "in_progress",
            picked_by_hand: false,
          },
        ],
      }),
      "me",
      new Map([[10, "https://img/ffx.jpg"]]),
      "2026-11-17",
    );
    expect(view).toMatchObject({
      name: "Backlog Slayer",
      you: true,
      segments: [true, true, false],
      clearedGames: [{ game_id: 10, cover_url: "https://img/ffx.jpg" }],
      inProgressGames: [{ game_id: 11, cover_url: null }],
      dateLine: "Started 23 Sep",
    });
  });

  it("dates an ended Run by when it ended", () => {
    const view = runCardView(
      run(1, { status: "finished", ended_at: "2026-11-06T15:00:00Z" }),
      "x",
      new Map(),
      "2026-11-17",
    );
    expect(view.dateLine).toBe("Finished 6 Nov");
  });
});

describe("runCardView with the API's clients pass", () => {
  it("takes an entry's own cover before the Pool preview's", () => {
    const view = runCardView(
      run(2, {
        entries: [
          { game_id: 10, title: "FF X", state: "cleared", picked_by_hand: false, cover_url: "https://img/own.jpg" },
        ],
      }),
      "x",
      new Map([[10, "https://img/pool.jpg"]]),
      "2026-11-17",
    );
    expect(view.clearedGames[0].cover_url).toBe("https://img/own.jpg");
  });

  it("carries the member's Discord avatar when the API sends one", () => {
    const view = runCardView(
      run(3, { user: { user_id: "42", username: "owl", discord_avatar: "abc" } }),
      "x",
      new Map(),
      "2026-11-17",
    );
    expect(view.avatarUrl).toBe("https://cdn.discordapp.com/avatars/42/abc.png?size=64");
    expect(runCardView(run(4), "x", new Map(), "2026-11-17").avatarUrl).toBeNull();
  });

  it("lets the viewer delete their own Run once it has ended", () => {
    const ended = run(5, { user: { user_id: "me", username: "me" }, status: "abandoned" });
    expect(runCardView(ended, "me", new Map(), "2026-11-17").canDelete).toBe(true);
    expect(runCardView({ ...ended, status: "active" }, "me", new Map(), "2026-11-17").canDelete).toBe(false);
    expect(runCardView(ended, "someone", new Map(), "2026-11-17").canDelete).toBe(false);
  });
});

describe("helpers", () => {
  it("has no avatar without a hash", () => {
    expect(memberAvatar({ user_id: "1", discord_avatar: null })).toBeNull();
    expect(memberAvatar({ user_id: "1" })).toBeNull();
  });

  it("falls back to the picture the bot stores", () => {
    expect(memberAvatar({ user_id: "1", avatar_url: "/api/v1/users/1/avatar" }, "https://api.test")).toBe(
      "https://api.test/api/v1/users/1/avatar",
    );
  });

  it("caps segments at twenty, each a share of a long target", () => {
    expect(runSegments(5, 3)).toEqual([true, true, true]);
    expect(runSegments(20, 40).filter(Boolean)).toHaveLength(10);
    expect(runSegments(0, 40)).toHaveLength(20);
  });

  it("takes two initials", () => {
    expect(initials("Crit Fisher")).toBe("CF");
    expect(initials("backlog_slayer")).toBe("BS");
    expect(initials("xergg")).toBe("XE");
  });
});
