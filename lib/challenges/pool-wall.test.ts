import { describe, expect, it } from "vitest";

import { filterWall, optionalSourcesLine, parsePlayed, poolKey, poolWall, splitWall } from "@/lib/challenges/pool-wall";
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

const names = (members: { name: string }[]) => members.map((m) => m.name);

describe("poolWall", () => {
  const tiles = poolWall(
    [
      game(1, { cleared_by: [{ ...crit, run_id: 1, cleared_on: "2026-10-01" }], in_progress: [{ ...me, run_id: 2 }] }),
      game(2, { in_progress: [{ ...crit, run_id: 1 }] }),
      game(3),
    ],
    "me",
    poolKey({
      optional_target: 1,
      core_games: [{ game_id: 1, title: "Game 1" }],
      optional_games: [
        { game_id: 2, title: "Game 2", source: "franchise", new: true },
        { game_id: 3, title: "Game 3", source: "hand", new: false },
      ],
    }),
  );

  it("tags each cover with who Cleared it and who is playing it, from the Pool's progress", () => {
    expect(tiles[0]).toMatchObject({ yours: true, core: true, tag: null });
    expect([names(tiles[0].cleared), names(tiles[0].inProgress)]).toEqual([["Crit Fisher"], ["Night Owl"]]);
    expect(tiles[1]).toMatchObject({ cleared: [], yours: false, tag: "new", source: "franchise" });
    expect(names(tiles[1].inProgress)).toEqual(["Crit Fisher"]);
    expect(tiles[2]).toMatchObject({ cleared: [], inProgress: [], core: false, tag: "added", source: "hand" });
    expect(tiles[0].game).toMatchObject({ game_id: 1, title: "Game 1" });
  });

  it("names a member once per game, by their Clear", () => {
    const again = poolWall(
      [game(1, { cleared_by: [{ ...crit, run_id: 1 }], in_progress: [{ ...crit, run_id: 3 }] })],
      "me",
      poolKey(null),
    );
    expect(names(again[0].cleared)).toEqual(["Crit Fisher"]);
    expect(again[0].inProgress).toEqual([]);
  });

  it("gives each mark the member's id and picture, for the link to their profile", () => {
    const [tile] = poolWall([game(1, { cleared_by: [{ ...crit, run_id: 1 }] })], "me", poolKey(null));
    expect(tile.cleared[0]).toMatchObject({ userId: "c", name: "Crit Fisher" });
    expect(tile.cleared[0].avatarUrl).toMatch(/\/api\/v1\/users\/c\/avatar$/);
  });

  it("filters to the games the club played or didn't", () => {
    expect(filterWall(tiles, "played").map((t) => t.game.game_id)).toEqual([1, 2]);
    expect(filterWall(tiles, "unplayed").map((t) => t.game.game_id)).toEqual([3]);
    expect(parsePlayed("x")).toBe("all");
  });

  it("splits the wall into Core then Optional", () => {
    const { core, optional } = splitWall(tiles);
    expect(core.map((t) => t.game.game_id)).toEqual([1]);
    expect(optional.map((t) => t.game.game_id)).toEqual([2, 3]);
  });

  it("names what feeds the Optional Games", () => {
    expect(
      optionalSourcesLine({
        optional_target: 0,
        franchises: [{ franchise_id: 1, name: "Final Fantasy" }],
        collections: [{ collection_id: 7, name: "Final Fantasy VII" }],
      }),
    ).toBe("From the Final Fantasy Franchise and the Final Fantasy VII Series");
    expect(optionalSourcesLine(null)).toBeNull();
  });
});
