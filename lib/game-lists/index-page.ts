import { fetchGameLists, fetchGameSummary, fetchListsWhole } from "@/lib/game-lists/api";
import { leadWith, matchLists, placeOf } from "@/lib/game-lists/order";
import type { GameList, GameListGame } from "@/lib/game-lists/types";

// The /lists index's data (server only): every list the viewer may read,
// the club's first, narrowed by the search. The club's lists are read whole
// for the fifth cover their deck fans out with; a search by a game reads
// the matching lists whole for the game's place in each.

export interface ListsIndexPage {
  club: GameList[];
  members: GameList[];
  // Up to five covers per club list; under a game search, each member
  // list's first four led by the game.
  covers: Map<number, GameListGame[]>;
  // The searched game's place, per list.
  hits: Map<number, { title: string; place: number | null; of: number }>;
  game: GameListGame | null;
  total: number;
}

// How many lists a game search reads whole for its place line.
const HIT_READS = 40;

export function parseListsQuery(query: { q?: string | string[]; game?: string | string[] }) {
  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
  const gameId = Number.parseInt(first(query.game), 10);
  return { q: first(query.q).trim().slice(0, 100), gameId: Number.isInteger(gameId) && gameId > 0 ? gameId : null };
}

export async function loadListsIndex(q: string, gameId: number | null): Promise<ListsIndexPage | null> {
  const [all, everything] = await Promise.all([fetchGameLists(gameId), gameId ? fetchGameLists() : null]);
  if (!all) return null;
  const shown = matchLists(all, q);
  const club = shown.filter((l) => l.club);
  const members = shown.filter((l) => !l.club);
  const wholeIds = [...club.map((l) => l.id), ...(gameId ? members.slice(0, HIT_READS).map((l) => l.id) : [])];
  const [whole, summary] = await Promise.all([fetchListsWhole(wholeIds), gameId ? fetchGameSummary(gameId) : null]);

  const covers = new Map<number, GameListGame[]>();
  for (const list of club) {
    covers.set(list.id, whole.get(list.id)?.entries?.slice(0, 5).map((e) => e.game) ?? list.preview_games);
  }
  const hits = new Map<number, { title: string; place: number | null; of: number }>();
  if (gameId) {
    for (const [id, list] of whole) {
      const place = placeOf(list.entries ?? [], gameId);
      if (!place) continue;
      if (!list.club) covers.set(id, leadWith((list.entries ?? []).map((e) => e.game), gameId).slice(0, 4));
      const title = list.entries?.[place.place - 1]?.game.title ?? summary?.title ?? "This game";
      hits.set(id, { title, place: list.sort === "ranked" ? place.place : null, of: place.of });
    }
  }
  return { club, members, covers, hits, game: summary, total: (everything ?? all).length };
}
