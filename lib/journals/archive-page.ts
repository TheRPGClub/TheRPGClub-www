import {
  fetchJournalContributors,
  fetchJournalGame,
  fetchJournaledGames,
  searchJournalEntries,
} from "@/lib/api/journals";
import { firstParam, type RawSearchParams } from "@/lib/search-params";
import { sortChapters } from "@/lib/journals";

// /journals: every member's Game Journal, the archive (a shelf of member
// volumes, most games journaled first, with the pulled volume's title page
// beside it) over the catalogue, a search across every entry.
//
// ?vol=<member> pulls a volume, ?shelf=all stands every volume up, and
// ?q= / ?by=<member> / ?game=<id> / ?page= drive the catalogue.

const SHELF_VOLUMES = 10;
const CATALOGUE_PER_PAGE = 20;

export interface ArchiveQuery {
  q: string;
  by: string | null;
  gameId: number | null;
  page: number;
  wholeShelf: boolean;
  vol: string | null;
}

export function parseArchiveQuery(query: RawSearchParams): ArchiveQuery {
  const game = parseInt(firstParam(query.game) ?? "", 10);
  return {
    q: (firstParam(query.q) ?? "").trim(),
    by: firstParam(query.by) || null,
    gameId: Number.isInteger(game) && game > 0 ? game : null,
    page: Math.max(1, parseInt(firstParam(query.page) ?? "1", 10) || 1),
    wholeShelf: firstParam(query.shelf) === "all",
    vol: firstParam(query.vol) || null,
  };
}

// The page's address with `changes` applied: the page keeps its own params
// (the search, the filters, the shelf and the pulled volume) as volumes are
// pulled and searches change, but never the catalogue's page.
export function archiveHref(
  query: ArchiveQuery,
  changes: Record<string, string | null>,
  hash = "",
): string {
  const next = new URLSearchParams(archiveParams(query));
  for (const [k, v] of Object.entries(changes)) {
    if (v) next.set(k, v);
    else next.delete(k);
  }
  const qs = next.toString();
  return `/journals${qs ? `?${qs}` : ""}${hash}`;
}

// The params the page keeps, for the catalogue's filters to carry too.
export function archiveParams(query: ArchiveQuery): Record<string, string> {
  const kept: Record<string, string> = {};
  if (query.q) kept.q = query.q;
  if (query.by) kept.by = query.by;
  if (query.gameId) kept.game = String(query.gameId);
  if (query.wholeShelf) kept.shelf = "all";
  if (query.vol) kept.vol = query.vol;
  return kept;
}

export async function loadJournalArchive(query: ArchiveQuery) {
  const { q, by, gameId, page, wholeShelf, vol } = query;
  // With no filter the catalogue's own count is the whole archive's, so the
  // separate count read is only for a filtered search.
  const filtered = Boolean(q || by || gameId);
  const [contributors, everything, results, filterGame, volGames] = await Promise.all([
    fetchJournalContributors(),
    filtered ? searchJournalEntries({ per: 1 }) : null,
    searchJournalEntries({
      q: q || undefined,
      userId: by ?? undefined,
      gameId: gameId ?? undefined,
      page,
      per: CATALOGUE_PER_PAGE,
    }),
    gameId ? fetchJournalGame(gameId) : null,
    // The pulled volume's games, when the URL names it: read alongside.
    vol ? fetchJournaledGames(vol) : null,
  ]);

  const people = contributors?.data ?? [];
  const pulled = people.find((c) => c.user_id === vol) ?? people[0] ?? null;
  const pulledGames = !pulled
    ? null
    : pulled.user_id === vol
      ? volGames
      : await fetchJournaledGames(pulled.user_id);

  return {
    filtered,
    // null when the archive couldn't be read.
    people: contributors ? people : null,
    onShelf: wholeShelf ? people : people.slice(0, SHELF_VOLUMES),
    pulled,
    pulledChapters: pulledGames ? sortChapters(pulledGames.data) : null,
    results,
    entryTotal: (filtered ? everything : results)?.meta.count ?? null,
    contributorTotal: contributors?.meta.count ?? people.length,
    // The filtered game's title: the game read, else any matching entry's
    // game, else its id.
    filterGameTitle:
      filterGame?.title ?? results?.data.find((e) => e.game)?.game?.title ?? `Game ${gameId}`,
  };
}

export type JournalArchive = Awaited<ReturnType<typeof loadJournalArchive>>;
