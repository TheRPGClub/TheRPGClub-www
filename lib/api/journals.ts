import { apiFetch } from "@/lib/api";
import type {
  ApiCollection,
  ApiSingle,
  CollectionMeta,
  GameSummary,
  JournalContributor,
  JournalEntryGameUser,
  JournalEntryUser,
  JournaledGame,
} from "@/lib/api/types";

// Server reads for the Game Journal surfaces. Each returns null when the read
// fails, so a page can say so instead of showing an empty journal.

// The API's page-size ceiling: one read covers a member's contents or a
// game's whole journal in all but extreme cases.
export const JOURNAL_READ_MAX = 500;

export interface JournalPage<T> {
  data: T[];
  meta: CollectionMeta;
}

async function readCollection<T>(path: string): Promise<JournalPage<T> | null> {
  try {
    const res = await apiFetch(path, { cache: "no-store" });
    if (!res.ok) return null;
    const body = (await res.json()) as ApiCollection<T>;
    const data = body.data ?? [];
    const meta: CollectionMeta = {
      page: body.meta?.page ?? 1,
      pages: body.meta?.pages ?? 1,
      count: body.meta?.count ?? data.length,
      per: body.meta?.per ?? data.length,
      prev: body.meta?.prev ?? null,
      next: body.meta?.next ?? null,
    };
    return { data, meta };
  } catch {
    return null;
  }
}

function query(params: Record<string, string | number | null | undefined>): string {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== null && v !== undefined && v !== "") qs.set(k, String(v));
  }
  const s = qs.toString();
  return s ? `?${s}` : "";
}

// A member's Contents: one row per journaled game (ordered by title on the
// API; the page re-sorts).
export function fetchJournaledGames(userId: string) {
  return readCollection<JournaledGame>(
    `/api/v1/users/${encodeURIComponent(userId)}/journal${query({ per: JOURNAL_READ_MAX })}`,
  );
}

// Entries for one game, newest first; `userId` narrows to one member's
// chapter.
export function fetchGameJournal(
  gameId: number,
  opts: { userId?: string; page?: number; per?: number } = {},
) {
  return readCollection<JournalEntryUser>(
    `/api/v1/games/${gameId}/journal${query({
      user_id: opts.userId,
      page: opts.page,
      per: opts.per ?? JOURNAL_READ_MAX,
    })}`,
  );
}

// The catalogue search across every member, newest first.
export function searchJournalEntries(opts: {
  q?: string;
  userId?: string;
  gameId?: number;
  page?: number;
  per?: number;
}) {
  return readCollection<JournalEntryGameUser>(
    `/api/v1/journal_entries${query({
      q: opts.q,
      user_id: opts.userId,
      game_id: opts.gameId,
      page: opts.page,
      per: opts.per,
    })}`,
  );
}

// Everyone with an entry, most games journaled first.
export function fetchJournalContributors() {
  return readCollection<JournalContributor>(
    `/api/v1/journal_entries/contributors${query({ per: JOURNAL_READ_MAX })}`,
  );
}

// When a member opened their chapter on a game: the oldest entry, which is
// the last one in the newest-first list. One extra read, only for a chapter
// longer than the page that is open.
export async function fetchFirstEntryAt(
  gameId: number,
  userId: string,
  count: number,
): Promise<string | null> {
  if (count <= 0) return null;
  const oldest = await fetchGameJournal(gameId, { userId, page: count, per: 1 });
  return oldest?.data[0]?.created_at ?? null;
}

// The game a journal page names (the catalogue's game filter, a chapter not
// in the book yet), or null when it can't be read (404 while Game Index isn't
// open to the viewer).
export async function fetchJournalGame(gameId: number): Promise<GameSummary | null> {
  try {
    const res = await apiFetch(`/api/v1/games/${gameId}`, { cache: "no-store" });
    if (!res.ok) return null;
    return ((await res.json()) as ApiSingle<GameSummary>).data;
  } catch {
    return null;
  }
}

// The GameDB ids on one of a member's lists (Now Playing, Game Completions),
// for a chapter's marks. Empty when the read fails.
export async function fetchListedGameIds(
  userId: string,
  list: "now_playing" | "completions",
): Promise<Set<number>> {
  try {
    const res = await apiFetch(`/api/v1/users/${userId}/${list}?per=${JOURNAL_READ_MAX}`, {
      cache: "no-store",
    });
    if (!res.ok) return new Set();
    const body = (await res.json()) as ApiCollection<{ gamedb_game_id: number | null }>;
    return new Set(body.data.map((row) => row.gamedb_game_id).filter((n): n is number => n != null));
  } catch {
    return new Set();
  }
}
