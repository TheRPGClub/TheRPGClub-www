import { describe, expect, it } from "vitest";
import {
  coverState,
  dialArcs,
  dialPercent,
  formatPlaytime,
  memberGroups,
  monthYear,
  playtimeTag,
  progressMemberAvatar,
  progressTabCount,
  rankMeter,
  standing,
} from "./progress";
import type { FranchiseProgressMember, FranchiseProgressMeters } from "./types";

const meters = (main: [number, number], all: [number, number], spin: [number, number], minutes = 0): FranchiseProgressMeters => ({
  mainline: { done: main[0], total: main[1], playtime_minutes: minutes },
  all: { done: all[0], total: all[1], playtime_minutes: minutes },
  spin_offs: { done: spin[0], total: spin[1], playtime_minutes: 0 },
});

// Parses "M x y A r r 0 0 1 x y" into its two points.
function ends(d: string): [number, number, number, number] {
  const n = d.match(/-?\d+(\.\d+)?/g)!.map(Number);
  return [n[0], n[1], n[7], n[8]];
}

describe("dialArcs", () => {
  const geo = { width: 200, stroke: 17 };

  it("draws one segment per game, the done ones first, left to right", () => {
    const dial = dialArcs(11, 16, geo);
    expect(dial.empty).toBe(false);
    expect(dial.segments).toHaveLength(16);
    expect(dial.segments.filter((s) => s.on)).toHaveLength(11);
    expect(dial.segments.slice(0, 11).every((s) => s.on)).toBe(true);
    const [x0, y0] = ends(dial.segments[0].d);
    const [, , x1, y1] = ends(dial.segments[15].d);
    expect(x0).toBeCloseTo(dial.cx - dial.r, 1);
    expect(y0).toBeCloseTo(dial.cy, 1);
    expect(x1).toBeCloseTo(dial.cx + dial.r, 1);
    expect(y1).toBeCloseTo(dial.cy, 1);
  });

  it("keeps a gap between segments but none at the ends", () => {
    const dial = dialArcs(1, 2, geo);
    const [, , ax, ay] = ends(dial.segments[0].d);
    const [bx, by] = ends(dial.segments[1].d);
    expect(ax).toBeLessThan(bx);
    expect(ay).toBeLessThan(dial.cy);
    expect(by).toBeLessThan(dial.cy);
    // The top of the arc sits between the two segments.
    expect((ax + bx) / 2).toBeCloseTo(dial.cx, 1);
  });

  it("draws a single game as the whole arc", () => {
    const dial = dialArcs(1, 1, geo);
    expect(dial.segments).toHaveLength(1);
    const [x0, , x1] = ends(dial.segments[0].d);
    expect(x0).toBeCloseTo(dial.cx - dial.r, 1);
    expect(x1).toBeCloseTo(dial.cx + dial.r, 1);
  });

  it("fits the arc and its stroke inside the box", () => {
    const dial = dialArcs(3, 5, geo);
    expect(dial.cx - dial.r - geo.stroke / 2).toBeGreaterThanOrEqual(0);
    expect(dial.cx + dial.r + geo.stroke / 2).toBeLessThanOrEqual(geo.width);
    expect(dial.cy - dial.r - geo.stroke / 2).toBeGreaterThanOrEqual(0);
    expect(dial.height).toBeGreaterThanOrEqual(dial.cy);
  });

  it("clamps done to the total and never below zero", () => {
    expect(dialArcs(20, 4, geo).segments.filter((s) => s.on)).toHaveLength(4);
    expect(dialArcs(-2, 4, geo).segments.filter((s) => s.on)).toHaveLength(0);
  });

  it("is one empty arc when the meter has no games", () => {
    const dial = dialArcs(0, 0, geo);
    expect(dial.empty).toBe(true);
    expect(dial.segments).toHaveLength(1);
    expect(dial.segments[0].on).toBe(false);
  });
});

describe("dialPercent", () => {
  it("rounds to a whole percent", () => {
    expect(dialPercent(11, 16)).toBe(69);
    expect(dialPercent(5, 15)).toBe(33);
    expect(dialPercent(16, 16)).toBe(100);
    expect(dialPercent(0, 16)).toBe(0);
  });

  it("never reads 100 before the last game, or 0 after the first", () => {
    expect(dialPercent(199, 200)).toBe(99);
    expect(dialPercent(1, 300)).toBe(1);
  });

  it("is null for an empty meter", () => {
    expect(dialPercent(0, 0)).toBeNull();
  });
});

describe("formatPlaytime", () => {
  it("rounds minutes to hours with grouping", () => {
    expect(formatPlaytime(0)).toBe("0 h");
    expect(formatPlaytime(90)).toBe("2 h");
    expect(formatPlaytime(949 * 60 + 10)).toBe("949 h");
    expect(formatPlaytime(1640 * 60)).toBe("1,640 h");
  });

  it("says under an hour rather than 0 h for a little time", () => {
    expect(formatPlaytime(12)).toBe("<1 h");
  });
});

describe("coverState and playtimeTag", () => {
  it("is done with a Completion, played with Playtime, else never played", () => {
    expect(coverState({ done: true, playtime_minutes: 0 })).toBe("done");
    expect(coverState({ done: false, playtime_minutes: 30 })).toBe("played");
    expect(coverState({ done: false, playtime_minutes: 0 })).toBe("unplayed");
  });

  it("tags hours, or why there are none", () => {
    expect(playtimeTag({ done: false, playtime_minutes: 1080 })).toEqual({ text: "18 h", quiet: false });
    expect(playtimeTag({ done: false, playtime_minutes: 0 })).toEqual({ text: "Not played", quiet: true });
    expect(playtimeTag({ done: true, playtime_minutes: 0 })).toEqual({ text: "No Playtime", quiet: true });
  });
});

describe("progressTabCount and rankMeter", () => {
  it("counts Mainline", () => {
    expect(progressTabCount(meters([11, 16], [16, 31], [5, 15]))).toBe("11/16");
  });

  it("falls back to everything when there is no Mainline", () => {
    const m = meters([0, 0], [3, 19], [3, 19]);
    expect(progressTabCount(m)).toBe("3/19");
    expect(rankMeter(m)).toBe("all");
    expect(rankMeter(meters([1, 2], [1, 2], [0, 0]))).toBe("mainline");
  });
});

describe("memberGroups", () => {
  const member = (id: string, conquered_at: string | null): FranchiseProgressMember => ({
    user: { user_id: id, username: id, global_name: null, is_bot: false, role_admin: false, role_moderator: false, role_regular: false },
    meters: meters([1, 2], [1, 3], [0, 1]),
    conquered_at,
  });

  it("splits the API's order into Conquered and still going, keeping the ranks running", () => {
    const groups = memberGroups([member("a", "2024-01-02T12:00:00Z"), member("b", null), member("c", null)]);
    expect(groups.conquered.map((r) => [r.member.user.user_id, r.rank])).toEqual([["a", 1]]);
    expect(groups.going.map((r) => [r.member.user.user_id, r.rank])).toEqual([["b", 2], ["c", 3]]);
  });
});

describe("progressMemberAvatar", () => {
  const user = { user_id: "42" };

  it("is their Discord avatar when the API knows its hash", () => {
    expect(progressMemberAvatar({ ...user, discord_avatar: "abc", avatar_url: "/api/v1/users/42/avatar" }, "https://api.test")).toBe(
      "https://cdn.discordapp.com/avatars/42/abc.png?size=64",
    );
  });

  it("else the avatar the bot stores, on the API's address", () => {
    expect(progressMemberAvatar({ ...user, discord_avatar: null, avatar_url: "/api/v1/users/42/avatar" }, "https://api.test")).toBe(
      "https://api.test/api/v1/users/42/avatar",
    );
  });

  it("is null with neither (an older API), for the initials", () => {
    expect(progressMemberAvatar(user, "https://api.test")).toBeNull();
  });
});

describe("monthYear", () => {
  it("reads a Conquest's month in UTC", () => {
    expect(monthYear("2025-03-01T00:30:00Z")).toBe("Mar 2025");
  });
});

describe("standing", () => {
  it("names the Conquest, else the Mainline games left, else nothing", () => {
    expect(standing(meters([16, 16], [20, 31], [4, 15]), "2025-03-10T12:00:00Z")).toBe("Conquered Mar 2025");
    expect(standing(meters([11, 16], [16, 31], [5, 15]), null)).toBe("5 Mainline to go");
    expect(standing(meters([0, 0], [3, 19], [3, 19]), null)).toBeNull();
  });
});
