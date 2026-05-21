import type {
  GameCollection,
  GameCompletion,
  UserBacklog,
  UserFavorite,
  UserNowPlaying,
} from "./types";

export type GameListKind =
  | "favorite"
  | "backlog"
  | "now_playing"
  | "completed"
  | "collection";

export type GameListEntry =
  | UserFavorite
  | UserBacklog
  | UserNowPlaying
  | GameCompletion
  | GameCollection;

// Each list uses a Rails-style resource-specific PK (e.g. `completion_id`).
// We try the canonical key first, then fall back to a generic `entry_id` to
// stay compatible if the backend ever renames things.
const PK_FIELDS: Record<GameListKind, string[]> = {
  favorite: ["favorite_id", "entry_id"],
  backlog: ["backlog_id", "entry_id"],
  now_playing: ["now_playing_id", "entry_id"],
  completed: ["completion_id", "entry_id"],
  collection: ["collection_id", "entry_id"],
};

export function resolveEntryId(
  kind: GameListKind,
  entry: GameListEntry,
): number | undefined {
  const candidates = PK_FIELDS[kind];
  for (const field of candidates) {
    const value = (entry as unknown as Record<string, unknown>)[field];
    if (typeof value === "number") return value;
  }
  return undefined;
}
