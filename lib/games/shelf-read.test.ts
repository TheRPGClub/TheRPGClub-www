import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Game } from "@/lib/api/types";
import type { ShelfShown } from "./shelf";

// The API's member lists, by path: what each read returns.
let lists: Record<string, { data: unknown[]; count?: number }> = {};
const calls: string[] = [];
vi.mock("@/lib/api", () => ({
  apiFetch: async (path: string) => {
    calls.push(path);
    const url = new URL(path, "http://api");
    const hit = lists[url.pathname + (url.searchParams.has("game_id") ? "?game" : "")];
    if (!hit) return Response.json({ data: [], meta: { count: 0 } });
    return Response.json({ data: hit.data, meta: { count: hit.count ?? hit.data.length } });
  },
}));

// Platforms come through the shared (club-wide) cache.
vi.mock("@/lib/api/shared", () => ({ fetchPlatforms: async () => [] }));

const { fetchGameShelf } = await import("./shelf-read");

const ALL: ShelfShown = { now_playing: true, completed: true, backlog: true, favorite: true, collection: true };
const game = { game_id: 7, title: "Chrono Trigger", completions: [], now_playing: [] } as unknown as Game;
const base = "/api/v1/users/u";

beforeEach(() => {
  lists = {};
  calls.length = 0;
});

describe("fetchGameShelf", () => {
  it("reads Backlog and Collection by game and keeps every entry of it", async () => {
    lists[`${base}/backlog?game`] = { data: [{ backlog_id: 1, gamedb_game_id: 7 }, { backlog_id: 2, gamedb_game_id: 7 }] };
    lists[`${base}/collections?game`] = { data: [{ collection_id: 3, gamedb_game_id: 7 }] };

    const { shelf } = await fetchGameShelf(game, "u", ALL);

    expect(shelf.backlog.map((b) => b.backlog_id)).toEqual([1, 2]);
    expect(shelf.collection).toHaveLength(1);
    expect(calls).toContain(`${base}/backlog?game_id=7&per=50`);
    expect(calls.some((c) => c.startsWith(`${base}/backlog?per=`))).toBe(false);
  });

  it("doesn't read the whole Favorites list for a game that isn't a Favorite", async () => {
    const { shelf } = await fetchGameShelf(game, "u", ALL);

    expect(shelf.favorite).toBeNull();
    expect(calls).toContain(`${base}/favorites?game_id=7&per=1`);
    expect(calls.some((c) => c.startsWith(`${base}/favorites?per=`))).toBe(false);
  });

  it("places a Favorite by the whole list's order", async () => {
    lists[`${base}/favorites?game`] = { data: [{ favorite_id: 9, gamedb_game_id: 7 }] };
    lists[`${base}/favorites`] = {
      data: [{ favorite_id: 8, gamedb_game_id: 3 }, { favorite_id: 9, gamedb_game_id: 7 }, { favorite_id: 10, gamedb_game_id: 4 }],
    };

    const { shelf } = await fetchGameShelf(game, "u", ALL);

    expect(shelf.favorite).toMatchObject({ rank: 2, of: 3 });
  });

  it("reads nothing for a list the viewer isn't shown", async () => {
    await fetchGameShelf(game, "u", { ...ALL, backlog: false, favorite: false, collection: false });

    // Platforms come from the shared cache (mocked above), not a member read.
    expect(calls).toEqual([]);
  });
});
