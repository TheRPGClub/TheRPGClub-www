import { describe, expect, it } from "vitest";

import { filterWall, parsePlayed, poolWall } from "@/lib/challenges/pool-wall";
import type { PoolProgressGame } from "@/lib/challenges/types";

const crit = { user_id: "c", username: "crit", global_name: "Crit Fisher" };
const me = { user_id: "me", username: "me", global_name: "Night Owl" };

const game = (game_id: number, over: Partial<PoolProgressGame> = {}): PoolProgressGame => ({
  game_id,
  title: `Game ${game_id}`,
  cover_url: null,
  cleared_by: [],
  in_progress: [],
  ...over,
});

describe("poolWall", () => {
  const tiles = poolWall(
    [
      game(1, { cleared_by: [{ ...crit, run_id: 1, cleared_on: "2026-10-01" }], in_progress: [{ ...me, run_id: 2 }] }),
      game(2, { in_progress: [{ ...crit, run_id: 1 }] }),
      game(3),
    ],
    "me",
    new Set([3]),
  );

  it("tags each cover with who Cleared it and who is playing it, from the Pool's progress", () => {
    expect(tiles[0]).toMatchObject({ cleared: ["Crit Fisher"], inProgress: ["Night Owl"], yours: true, added: false });
    expect(tiles[1]).toMatchObject({ cleared: [], inProgress: ["Crit Fisher"], yours: false });
    expect(tiles[2]).toMatchObject({ cleared: [], inProgress: [], added: true });
    expect(tiles[0].game).toMatchObject({ game_id: 1, title: "Game 1" });
  });

  it("names a member once per game, by their Clear", () => {
    const again = poolWall(
      [game(1, { cleared_by: [{ ...crit, run_id: 1 }], in_progress: [{ ...crit, run_id: 3 }] })],
      "me",
      new Set(),
    );
    expect(again[0]).toMatchObject({ cleared: ["Crit Fisher"], inProgress: [] });
  });

  it("filters to the games the club played or didn't", () => {
    expect(filterWall(tiles, "played").map((t) => t.game.game_id)).toEqual([1, 2]);
    expect(filterWall(tiles, "unplayed").map((t) => t.game.game_id)).toEqual([3]);
    expect(parsePlayed("x")).toBe("all");
  });
});
