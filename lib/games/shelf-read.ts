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

// The game page's read of where the signed-in member's lists stand on this
// game (spec api#451, 1A). Now Playing and Game Completions come with the
// game; Collection filters by game; Backlog and Favorites have no game
// filter, so the page reads the member's whole list (up to the API's 500)
// and finds the game in it.

const WHOLE_LIST = 500;

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

export async function fetchGameShelf(game: Game, userId: string, shown: ShelfShown): Promise<GameShelfRead> {
  const base = `/api/v1/users/${userId}`;
  const gameId = game.game_id;
  const [platforms, backlog, favorites, collection] = await Promise.all([
    readList<Platform>("/api/v1/platforms?per=100"),
    shown.backlog ? readList<UserBacklog>(`${base}/backlog?per=${WHOLE_LIST}`) : null,
    shown.favorite ? readList<UserFavorite>(`${base}/favorites?per=${WHOLE_LIST}`) : null,
    shown.collection ? readList<GameCollection>(`${base}/collections?game_id=${gameId}&per=5`) : null,
  ]);
  const platformList = platforms?.data ?? [];
  const byId = new Map(platformList.map((p) => [p.platform_id, p]));
  const mine = <T extends { user_id: string }>(entries: T[] | undefined) => (entries ?? []).filter((e) => e.user_id === userId);

  // The game's own lists carry no platform; the completion timeline names it.
  const completions = shown.completed
    ? mine(game.completions).map((c) => ({ ...c, platform: c.platform ?? (c.platform_id ? byId.get(c.platform_id) ?? null : null) }))
    : [];
  const nowPlaying = shown.now_playing ? (mine(game.now_playing)[0] ?? null) : null;
  const favoriteIndex = favorites?.data.findIndex((f) => f.gamedb_game_id === gameId) ?? -1;

  return {
    platforms: platformList,
    shelf: {
      ...EMPTY_SHELF,
      nowPlaying,
      completions,
      backlog: backlog?.data.find((b) => b.gamedb_game_id === gameId) ?? null,
      favorite:
        favorites && favoriteIndex >= 0
          ? { entry: favorites.data[favoriteIndex], rank: favoriteIndex + 1, of: favorites.total }
          : null,
      collection: collection?.data.find((c) => c.gamedb_game_id === gameId) ?? null,
    },
  };
}
