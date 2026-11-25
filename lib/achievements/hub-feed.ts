import "server-only";
import {
  fetchAchievementFeed,
  type AchievementFeedFilters,
  type AchievementFeedPage,
} from "@/lib/api/achievement-feed";
import { paginationOf } from "@/lib/api/pagination";
import type { AchievementFeedCard } from "@/lib/api/types";

// Everything the hub page shows for one set of filters: the feed page and
// its paging.

export interface HubFeed {
  // null when the feed failed to load.
  result: AchievementFeedPage | null;
  cards: AchievementFeedCard[];
  total: number;
  totalPages: number;
}

export async function fetchHubFeed(filters: AchievementFeedFilters): Promise<HubFeed> {
  const result = await fetchAchievementFeed(filters);
  const cards = result?.cards ?? [];
  const { total, totalPages } = paginationOf(result?.meta ?? undefined, cards.length);
  return { result, cards, total, totalPages };
}
