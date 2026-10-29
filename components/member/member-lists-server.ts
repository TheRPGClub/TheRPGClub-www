import { apiFetch } from "@/lib/api";
import type {
  ApiCollection,
  ApiSingle,
  Game,
  GameCompletion,
  Platform,
} from "@/lib/api/types";
import { paginationOf } from "@/lib/api/pagination";

// Every one of a member's completions, walked page by page at the API's
// largest page size. `capped` is true when the walk stopped at `maxPages`
// before the end, so callers never present a partial set as the whole.
export async function fetchAllCompletions(
  userId: string,
  maxPages = 6,
): Promise<{ entries: GameCompletion[]; capped: boolean } | null> {
  const per = 500;
  const entries: GameCompletion[] = [];
  for (let page = 1; page <= maxPages; page++) {
    let res: Response;
    try {
      res = await apiFetch(
        `/api/v1/users/${userId}/completions?per=${per}&page=${page}`,
        { cache: "no-store" },
      );
    } catch {
      return null;
    }
    if (!res.ok) return null;
    const body: ApiCollection<GameCompletion> = await res.json();
    entries.push(...body.data);
    const { totalPages } = paginationOf(body.meta, body.data.length);
    if (page >= totalPages) return { entries, capped: false };
  }
  return { entries, capped: true };
}

// Collections and reviews come back without their game embedded (the API's
// collection and review indexes don't join it), so their covers and titles
// are looked up one game at a time. Reads are cached for an hour and
// de-duplicated; a failed read leaves that entry without a game.
export async function fetchGamesById(ids: number[]): Promise<Map<number, Game>> {
  const unique = [...new Set(ids.filter((id) => Number.isInteger(id) && id > 0))];
  const games = await Promise.all(
    unique.map(async (id) => {
      try {
        const res = await apiFetch(`/api/v1/games/${id}`, {
          next: { revalidate: 3600 },
        });
        if (!res.ok) return null;
        return ((await res.json()) as ApiSingle<Game>).data;
      } catch {
        return null;
      }
    }),
  );
  return new Map(
    games.filter((g): g is Game => g !== null).map((g) => [g.game_id, g]),
  );
}

// Embeds each entry's game when the API left it out, and rebuilds the
// collection index's flattened `platform_name`/`platform_abbreviation` into
// a platform object.
export async function withGames<
  T extends { gamedb_game_id: number | null; game?: Game | null; platform?: Platform | null; platform_id?: number | null },
>(entries: T[]): Promise<T[]> {
  const missing = entries
    .filter((e) => !e.game && e.gamedb_game_id)
    .map((e) => e.gamedb_game_id as number);
  const games = missing.length ? await fetchGamesById(missing) : new Map();
  return entries.map((entry) => {
    const flat = entry as T & {
      platform_name?: string | null;
      platform_abbreviation?: string | null;
    };
    const platform =
      entry.platform ??
      (flat.platform_name && entry.platform_id
        ? ({
            platform_id: entry.platform_id,
            platform_code: flat.platform_abbreviation ?? flat.platform_name,
            platform_name: flat.platform_name,
            platform_abbreviation: flat.platform_abbreviation ?? null,
            igdb_platform_id: null,
          } satisfies Platform)
        : entry.platform);
    return {
      ...entry,
      game: entry.game ?? (entry.gamedb_game_id ? games.get(entry.gamedb_game_id) ?? null : null),
      platform,
    };
  });
}
