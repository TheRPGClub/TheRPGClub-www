import { fetchListsWhole, fetchListsWithGame, fetchMemberGameLists } from "@/lib/game-lists/api";
import { placeOf } from "@/lib/game-lists/order";
import { CARDS_SHOWN, type GameListsSectionData } from "@/lib/game-lists/game-cards";
import { ENTRIES_MAX } from "@/lib/game-lists/types";

// The game page's In Game Lists section (pick 5C), server only: the lists
// holding the game that the viewer may read (the club's first), the first
// eight read whole for the game's place and its neighbouring covers, and
// the viewer's own lists for Add to list.

export async function loadGameListsSection(gameId: number, viewerId: string | null): Promise<GameListsSectionData | null> {
  const [holding, own] = await Promise.all([
    fetchListsWithGame(gameId),
    viewerId ? fetchMemberGameLists(viewerId) : Promise.resolve([]),
  ]);
  if (!holding) return null;
  const shown = holding.lists.slice(0, CARDS_SHOWN);
  const holdingIds = new Set(holding.lists.map((l) => l.id));
  const ownIn = (own ?? []).filter((l) => holdingIds.has(l.id));
  const whole = await fetchListsWhole([...new Set([...shown, ...ownIn].map((l) => l.id))]);
  const placeIn = (id: number) => placeOf(whole.get(id)?.entries ?? [], gameId);
  return {
    count: holding.count,
    cards: shown.map((list) => ({ list, place: placeIn(list.id) })),
    own: (own ?? []).map((list) => {
      const inList = holdingIds.has(list.id);
      const place = inList ? placeIn(list.id) : null;
      return {
        id: list.id,
        name: list.name,
        private: list.visibility === "private",
        ranked: list.sort === "ranked",
        count: list.entry_count,
        full: list.entry_count >= ENTRIES_MAX,
        place: place && list.sort === "ranked" ? place.place : null,
        inList,
      };
    }),
  };
}
