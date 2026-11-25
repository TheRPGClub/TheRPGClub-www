import { apiFetch } from "@/lib/api";
import type {
  ApiCollection,
  Game,
  GameCollection,
  Platform,
  UserBacklog,
  UserFavorite,
} from "@/lib/api/types";
import { paginationOf } from "@/lib/api/pagination";
import { EMPTY_SHELF, type GameShelf, type ShelfShown } from "./shelf";
import { fetchPlatforms } from "@/lib/api/shared";

// The game page's read of where the signed-in member's lists stand on this
// game (spec api#451, 1A). Now Playing and Game Completions come with the
// game; Backlog, Favorites and Collection filter by `game_id` (api#452c).
// A Favorite's place ("No. 2 of 10") needs the whole list (`sort_order` is
// not always 1..n), so it is read only when the game is a Favorite.

const WHOLE_LIST = 500;
// Backlog and Collection may hold one game more than once (platforms, copies).
const PER_GAME = 50;

async function readList<T>(path: string): Promise<{ data: T[]; total: number } | null> {
  try {
    const res = await apiFetch(path, { cache: "no-store" });
    if (!res.ok) return null;
    const body: ApiCollection<T> = await res.json();
    return { data: body.data, total: paginationOf(body.meta, body.data.length).total };
  } catch {
    return null;
  }
}

export interface GameShelfRead {
  shelf: GameShelf;
  platforms: Platform[];
}

// The Favorite and its place in the member's list, or null when the game
// isn't a Favorite (or the reads fail).
async function readFavorite(base: string, gameId: number): Promise<GameShelf["favorite"]> {
  const own = await readList<UserFavorite>(`${base}/favorites?game_id=${gameId}&per=1`);
  const entry = own?.data[0];
  if (!entry) return null;
  const whole = await readList<UserFavorite>(`${base}/favorites?per=${WHOLE_LIST}`);
  const index = whole?.data.findIndex((f) => f.gamedb_game_id === gameId) ?? -1;
  if (!whole || index < 0) return { entry, rank: 0, of: 0 };
  return { entry: whole.data[index], rank: index + 1, of: whole.total };
}

export async function fetchGameShelf(game: Game, userId: string, shown: ShelfShown): Promise<GameShelfRead> {
  const base = `/api/v1/users/${userId}`;
  const gameId = game.game_id;
  const [platforms, backlog, favorite, collection] = await Promise.all([
    fetchPlatforms(),
    shown.backlog ? readList<UserBacklog>(`${base}/backlog?game_id=${gameId}&per=${PER_GAME}`) : null,
    shown.favorite ? readFavorite(base, gameId) : null,
    shown.collection ? readList<GameCollection>(`${base}/collections?game_id=${gameId}&per=${PER_GAME}`) : null,
  ]);
  const platformList = platforms ?? [];
  const byId = new Map(platformList.map((p) => [p.platform_id, p]));
  const mine = <T extends { user_id: string }>(entries: T[] | undefined) => (entries ?? []).filter((e) => e.user_id === userId);
  const ofGame = <T extends { gamedb_game_id: number | null }>(entries: T[] | undefined) =>
    (entries ?? []).filter((e) => e.gamedb_game_id === gameId);

  // The game's own lists carry no platform; the completion timeline names it.
  const completions = shown.completed
    ? mine(game.completions).map((c) => ({ ...c, platform: c.platform ?? (c.platform_id ? byId.get(c.platform_id) ?? null : null) }))
    : [];
  const nowPlaying = shown.now_playing ? (mine(game.now_playing)[0] ?? null) : null;

  return {
    platforms: platformList,
    shelf: {
      ...EMPTY_SHELF,
      nowPlaying,
      completions,
      backlog: ofGame(backlog?.data),
      favorite,
      collection: ofGame(collection?.data),
    },
  };
}
