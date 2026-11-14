import "server-only";
import {
  fetchAchievementFeed,
  type AchievementFeedFilters,
  type AchievementFeedPage,
} from "@/lib/api/achievement-feed";
import { paginationOf } from "@/lib/api/pagination";
import type {
  AchievementFeedCard,
  AchievementFeedHighlight,
  AchievementSet,
} from "@/lib/api/types";
import { highlightsSince, hubWeek } from "@/lib/achievements/hub";
import { getSetTint } from "@/lib/achievements/tint";
import { fallbackTint, type SetTint } from "@/lib/achievements/tint-color";

// Everything the hub page shows for one set of filters: the feed page, this
// week's Highlights for Latest's rail, and one tint per Achievement Set on
// the page.

const RAIL_LIMIT = 6;

export interface HubFeed {
  // null when the feed failed to load.
  result: AchievementFeedPage | null;
  cards: AchievementFeedCard[];
  total: number;
  totalPages: number;
  railCards: AchievementFeedHighlight[];
  weekLabel: string;
  tints: (setId: number) => SetTint;
}

export async function fetchHubFeed(filters: AchievementFeedFilters): Promise<HubFeed> {
  const latest = filters.view === "latest";
  // The rail reads the Highlights view's first page under the same Provider.
  const [result, railResult] = await Promise.all([
    fetchAchievementFeed(filters),
    latest
      ? fetchAchievementFeed({ view: "highlights", provider: filters.provider, page: 1 })
      : null,
  ]);
  const cards = result?.cards ?? [];
  const { total, totalPages } = paginationOf(result?.meta ?? undefined, cards.length);
  const week = hubWeek(new Date());
  const railCards = highlightsSince(railResult?.cards ?? [], week.from, RAIL_LIMIT);
  const tints = await setTints([...cards, ...railCards]);
  return { result, cards, total, totalPages, railCards, weekLabel: week.label, tints };
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
