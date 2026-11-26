import { memberAvatar, memberName } from "@/lib/challenges/runs";
import type { ChallengeMember, ChallengePool, OptionalSource, PoolGame, PoolProgressGame } from "@/lib/challenges/types";

// The Pool view of a Challenge page (surface brief challenges-pool, 2B; pick
// 9A, www#170): the Pool's games as two cover walls, Core then Optional,
// each cover tagged with the members who Cleared it or have it In Progress,
// as the API's Pool progress counts them (the Season shown, or every Run
// while Always Open). Pure, client-safe.

export type PlayedFilter = "all" | "played" | "unplayed";

// A member's mark under a cover: their picture and a link to their profile.
export interface WallMember {
  userId: string;
  name: string;
  avatarUrl: string;
}

export interface WallTile {
  game: PoolGame;
  cleared: WallMember[];
  inProgress: WallMember[];
  // In the viewer's own Run.
  yours: boolean;
  core: boolean;
  // An Optional Game that joined in the last 14 days ("new"), or one the
  // Host picked by hand ("added").
  tag: "new" | "added" | null;
  // Where an Optional Game comes from (null for Core).
  source: OptionalSource | null;
}

// What the saved Pool says about its games, by id: which are Core, and each
// Optional Game's source and "new".
export interface PoolKey {
  core: ReadonlySet<number>;
  optional: ReadonlyMap<number, { source: OptionalSource; new: boolean }>;
}

export function poolKey(pool: ChallengePool | null | undefined): PoolKey {
  return {
    core: new Set((pool?.core_games ?? []).map((g) => g.game_id)),
    optional: new Map((pool?.optional_games ?? []).map((g) => [g.game_id, { source: g.source, new: g.new }])),
  };
}

export function parsePlayed(value: string | undefined): PlayedFilter {
  return value === "played" || value === "unplayed" ? value : "all";
}

export function poolWall(
  games: readonly PoolProgressGame[],
  viewerId: string,
  key: PoolKey,
): WallTile[] {
  return games.map(({ cleared_by, in_progress, ...game }) => {
    const clearedIds = new Set(cleared_by.map((m) => m.user_id));
    const playing = in_progress.filter((m) => !clearedIds.has(m.user_id));
    return {
      game,
      cleared: cleared_by.map(wallMember),
      inProgress: playing.map(wallMember),
      yours: [...cleared_by, ...playing].some((m) => m.user_id === viewerId),
      ...placeOf(game.game_id, key),
    };
  });
}

function wallMember(member: ChallengeMember): WallMember {
  return { userId: member.user_id, name: memberName(member), avatarUrl: memberAvatar(member) };
}

function placeOf(gameId: number, key: PoolKey): Pick<WallTile, "core" | "tag" | "source"> {
  if (key.core.has(gameId)) return { core: true, tag: null, source: null };
  const optional = key.optional.get(gameId);
  if (!optional) return { core: false, tag: null, source: null };
  return {
    core: false,
    tag: optional.new ? "new" : optional.source === "hand" ? "added" : null,
    source: optional.source,
  };
}

// The two walls, each in the Pool's order (oldest release first).
export function splitWall(tiles: readonly WallTile[]): { core: WallTile[]; optional: WallTile[] } {
  return { core: tiles.filter((t) => t.core), optional: tiles.filter((t) => !t.core) };
}

// "From the Final Fantasy Franchise and the Final Fantasy VII Series": what
// feeds the Optional Games (the linked list is named by www#172's "Made
// from"). Null without sources.
export function optionalSourcesLine(pool: ChallengePool | null | undefined): string | null {
  const names = [
    ...(pool?.franchises ?? []).map((f) => `the ${f.name} Franchise`),
    ...(pool?.collections ?? []).map((c) => `the ${c.name} Series`),
  ];
  if (names.length === 0) return null;
  const list = names.length === 1 ? names[0] : `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;
  return `From ${list}`;
}

export function isPlayed(tile: WallTile): boolean {
  return tile.cleared.length + tile.inProgress.length > 0;
}

export function filterWall(tiles: readonly WallTile[], filter: PlayedFilter): WallTile[] {
  if (filter === "all") return [...tiles];
  return tiles.filter((t) => isPlayed(t) === (filter === "played"));
}
