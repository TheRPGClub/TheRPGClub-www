import type { RunCardView } from "@/lib/challenges/runs";
import type { PoolGame } from "@/lib/challenges/types";

// The Pool view of a Challenge page (surface brief challenges-pool, 2B): the
// Pool's games as a cover wall, each tagged with the members who Cleared it
// or have it In Progress in the Runs shown. Pure, client-safe.

export type PlayedFilter = "all" | "played" | "unplayed";

export interface WallTile {
  game: PoolGame;
  cleared: string[];
  inProgress: string[];
  // In the viewer's own Run.
  yours: boolean;
  // Added to the Pool by hand by the Host.
  added: boolean;
}

export function parsePlayed(value: string | undefined): PlayedFilter {
  return value === "played" || value === "unplayed" ? value : "all";
}

export function poolWall(
  games: readonly PoolGame[],
  runs: readonly RunCardView[],
  addedIds: ReadonlySet<number>,
): WallTile[] {
  return games.map((game) => {
    const tile: WallTile = {
      game,
      cleared: [],
      inProgress: [],
      yours: false,
      added: addedIds.has(game.game_id),
    };
    for (const run of runs) {
      const cleared = run.clearedGames.some((g) => g.game_id === game.game_id);
      const playing = run.inProgressGames.some((g) => g.game_id === game.game_id);
      if (cleared) tile.cleared.push(run.name);
      else if (playing) tile.inProgress.push(run.name);
      if ((cleared || playing) && run.you) tile.yours = true;
    }
    return tile;
  });
}

export function isPlayed(tile: WallTile): boolean {
  return tile.cleared.length + tile.inProgress.length > 0;
}

export function filterWall(tiles: readonly WallTile[], filter: PlayedFilter): WallTile[] {
  if (filter === "all") return [...tiles];
  return tiles.filter((t) => isPlayed(t) === (filter === "played"));
}
