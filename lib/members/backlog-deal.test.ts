import { beforeEach, describe, expect, it, vi } from "vitest";

import type { BacklogPickParams } from "@/lib/api/backlog-pick";

// The pick endpoint as a seeded walk over a pool of games: position -> game,
// or a status to fail with.
let pool: (number | null)[] = [];
let failAt: Record<number, number> = {};
const calls: string[] = [];
vi.mock("@/lib/api", () => ({
  apiFetch: async (path: string) => {
    calls.push(path);
    const position = Number(new URL(path, "http://api").searchParams.get("position") ?? 0);
    if (failAt[position]) return new Response(null, { status: failAt[position] });
    const at = position % Math.max(pool.length, 1);
    const id = pool[at] ?? null;
    return Response.json({
      data: id === null ? null : { gamedb_game_id: id },
      meta: { seed: 42, position, next_position: position + 1, wrapped: position >= pool.length, total: pool.length, platforms: [] },
    });
  },
}));

const { dealHand, pickEmptyMessage } = await import("@/lib/members/backlog-deal");

const filters: BacklogPickParams = { source: "backlog", platformId: null, maxHours: null, seed: null, position: 0 };

beforeEach(() => {
  pool = [];
  failAt = {};
  calls.length = 0;
});

describe("dealHand", () => {
  it("deals three games walking the same seed, ending where the hand ends", async () => {
    pool = [1, 2, 3, 4];
    const deal = await dealHand("7", filters);
    expect(deal).toMatchObject({ kind: "ok", next: 3, wrapped: false, meta: { seed: 42 } });
    expect(deal.kind === "ok" && deal.picks.map((p) => p.gamedb_game_id)).toEqual([1, 2, 3]);
    expect(calls[1]).toContain("seed=42");
  });

  it("ends the hand early when the walk comes round to a game already dealt", async () => {
    pool = [1, 2];
    const deal = await dealHand("7", filters);
    expect(deal.kind === "ok" && deal.picks.map((p) => p.gamedb_game_id)).toEqual([1, 2]);
  });

  it("is empty when nothing fits", async () => {
    pool = [null];
    expect(await dealHand("7", filters)).toMatchObject({ kind: "empty", meta: { total: 1 } });
  });

  it("fails when the first pick fails, and keeps the cards dealt when a later one does", async () => {
    failAt = { 0: 503 };
    expect(await dealHand("7", filters)).toEqual({
      kind: "error",
      message: "Couldn't pick a game right now (HTTP 503).",
    });
    pool = [1, 2, 3];
    failAt = { 1: 500 };
    const deal = await dealHand("7", filters);
    expect(deal.kind === "ok" && deal.picks.map((p) => p.gamedb_game_id)).toEqual([1]);
  });
});

describe("pickEmptyMessage", () => {
  it("names why nothing was picked", () => {
    expect(pickEmptyMessage({ ...filters, maxHours: 1 }, 4)).toBe(
      "Nothing in your backlog has a HowLongToBeat time of 1 hour or less. Games with no time on file are skipped when you set a limit.",
    );
    expect(pickEmptyMessage({ ...filters, platformId: 2 }, 0)).toBe(
      "Nothing in your backlog on that platform that isn't already on Now Playing.",
    );
    expect(pickEmptyMessage(filters, 0)).toBe(
      "Nothing in your backlog to pick from. Games already on Now Playing are left out.",
    );
  });
});
