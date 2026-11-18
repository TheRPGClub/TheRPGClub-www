import { memberName } from "@/lib/challenges/runs";
import type { PoolGame, PoolProgressGame } from "@/lib/challenges/types";

// The Pool view of a Challenge page (surface brief challenges-pool, 2B): the
// Pool's games as a cover wall, each tagged with the members who Cleared it
// or have it In Progress, as the API's Pool progress counts them (the
// Season shown, or every Run while Always Open). Pure, client-safe.

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
  games: readonly PoolProgressGame[],
  viewerId: string,
  addedIds: ReadonlySet<number>,
): WallTile[] {
  return games.map(({ cleared_by, in_progress, ...game }) => {
    const clearedIds = new Set(cleared_by.map((m) => m.user_id));
    const playing = in_progress.filter((m) => !clearedIds.has(m.user_id));
    return {
      game,
      cleared: cleared_by.map(memberName),
      inProgress: playing.map(memberName),
      yours: [...cleared_by, ...playing].some((m) => m.user_id === viewerId),
      added: addedIds.has(game.game_id),
    };
  });
}

export function isPlayed(tile: WallTile): boolean {
  return tile.cleared.length + tile.inProgress.length > 0;
}

export function filterWall(tiles: readonly WallTile[], filter: PlayedFilter): WallTile[] {
  if (filter === "all") return [...tiles];
  return tiles.filter((t) => isPlayed(t) === (filter === "played"));
}
