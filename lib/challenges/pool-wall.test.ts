import { describe, expect, it } from "vitest";

import { filterWall, parsePlayed, poolWall } from "@/lib/challenges/pool-wall";
import type { RunCardView } from "@/lib/challenges/runs";

const game = (game_id: number) => ({ game_id, title: `Game ${game_id}` });
const run = (name: string, you: boolean, cleared: number[], playing: number[]) =>
  ({
    name,
    you,
    clearedGames: cleared.map(game),
    inProgressGames: playing.map(game),
  }) as unknown as RunCardView;

describe("poolWall", () => {
  const tiles = poolWall(
    [game(1), game(2), game(3)],
    [run("Crit", false, [1], [2]), run("Me", true, [], [1])],
    new Set([3]),
  );

  it("tags each cover with who Cleared it and who is playing it", () => {
    expect(tiles[0]).toMatchObject({
      cleared: ["Crit"],
      inProgress: ["Me"],
      yours: true,
      added: false,
    });
    expect(tiles[1]).toMatchObject({
      cleared: [],
      inProgress: ["Crit"],
      yours: false,
    });
    expect(tiles[2]).toMatchObject({
      cleared: [],
      inProgress: [],
      added: true,
    });
  });

  it("filters to the games the club played or didn't", () => {
    expect(filterWall(tiles, "played").map((t) => t.game.game_id)).toEqual([1, 2]);
    expect(filterWall(tiles, "unplayed").map((t) => t.game.game_id)).toEqual([3]);
    expect(parsePlayed("x")).toBe("all");
  });
});
