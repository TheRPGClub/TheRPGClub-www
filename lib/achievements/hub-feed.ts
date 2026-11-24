import "server-only";
import {
  fetchAchievementFeed,
  type AchievementFeedFilters,
  type AchievementFeedPage,
} from "@/lib/api/achievement-feed";
import { paginationOf } from "@/lib/api/pagination";
import type { AchievementFeedCard, AchievementSet } from "@/lib/api/types";
import { getSetTint } from "@/lib/achievements/tint";
import { fallbackTint, type SetTint } from "@/lib/achievements/tint-color";

// Everything the hub page shows for one set of filters: the feed page and
// one tint per Achievement Set on the page.

export interface HubFeed {
  // null when the feed failed to load.
  result: AchievementFeedPage | null;
  cards: AchievementFeedCard[];
  total: number;
  totalPages: number;
  tints: (setId: number) => SetTint;
}

export async function fetchHubFeed(filters: AchievementFeedFilters): Promise<HubFeed> {
  const result = await fetchAchievementFeed(filters);
  const cards = result?.cards ?? [];
  const { total, totalPages } = paginationOf(result?.meta ?? undefined, cards.length);
  const tints = await setTints(cards);
  return { result, cards, total, totalPages, tints };
}

// One tint per Achievement Set on the page, sampled once each.
async function setTints(cards: AchievementFeedCard[]): Promise<(setId: number) => SetTint> {
  const sets = new Map<number, AchievementSet>();
  for (const card of cards) sets.set(card.achievement_set.id, card.achievement_set);
  const entries = await Promise.all(
    [...sets.values()].map(
      async (set) =>
        [set.id, await getSetTint({ iconUrl: set.icon_url, setId: set.id })] as const,
    ),
  );
  const byId = new Map(entries);
  return (setId) => byId.get(setId) ?? fallbackTint(setId);
}
