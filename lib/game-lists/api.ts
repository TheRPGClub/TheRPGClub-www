import { apiFetch } from "@/lib/api";
import type { ApiCollection, ApiSingle } from "@/lib/api/types";
import { paginationOf } from "@/lib/api/pagination";
import type { GameList, GameListGame } from "@/lib/game-lists/types";

// Server-only reads of Game Lists as the signed-in member (they read the
// session cookie). Each answers null when the API can't be read, so a page
// can say so rather than fail. The API decides what the viewer may read:
// another member's Private list never comes back.

const MAX_PER = 500;

async function readJson<T>(path: string): Promise<T | null> {
  try {
    const res = await apiFetch(path, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

// Every list the viewer may read, the club's first, then the most recently
// changed; only those holding `gameId` when given.
export async function fetchGameLists(gameId?: number | null): Promise<GameList[] | null> {
  const game = gameId ? `&game_id=${gameId}` : "";
  const body = await readJson<ApiCollection<GameList>>(`/api/v1/game_lists?per=${MAX_PER}${game}`);
  return body?.data ?? null;
}

// One list with its entries in its own order; null when it doesn't exist
// or the viewer may not read it.
export async function fetchGameList(id: number): Promise<GameList | null> {
  if (!Number.isInteger(id) || id <= 0) return null;
  const body = await readJson<ApiSingle<GameList>>(`/api/v1/game_lists/${id}`);
  return body?.data ?? null;
}

// A member's lists the viewer may read (all their own, another member's
// Members-visible ones), most recently changed first.
export async function fetchMemberGameLists(userId: string): Promise<GameList[] | null> {
  const body = await readJson<ApiCollection<GameList>>(
    `/api/v1/users/${encodeURIComponent(userId)}/game_lists?per=${MAX_PER}`,
  );
  return body?.data ?? null;
}

// The lists holding a game that the viewer may read, the club's first, and
// how many there are.
export async function fetchListsWithGame(gameId: number): Promise<{ lists: GameList[]; count: number } | null> {
  const body = await readJson<ApiCollection<GameList>>(`/api/v1/games/${gameId}/game_lists?per=${MAX_PER}`);
  if (!body) return null;
  return { lists: body.data, count: paginationOf(body.meta, body.data.length).total };
}

// Many lists read whole at once (for covers past the preview's four, or a
// game's place in each); a list that can't be read is left out.
export async function fetchListsWhole(ids: readonly number[]): Promise<Map<number, GameList>> {
  const lists = await Promise.all(ids.map(fetchGameList));
  return new Map(lists.flatMap((l) => (l ? [[l.id, l] as const] : [])));
}

// A game's title and cover, for the index's search token.
export async function fetchGameSummary(gameId: number): Promise<GameListGame | null> {
  const body = await readJson<ApiSingle<GameListGame>>(`/api/v1/games/${gameId}`);
  return body ? { game_id: body.data.game_id, title: body.data.title, cover_url: body.data.cover_url } : null;
}
