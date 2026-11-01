import { apiFetch } from "@/lib/api";
import { firstParam, type RawSearchParams } from "@/lib/search-params";
import { isAchievementProvider, isUnknownUnlockDate } from "@/lib/achievements";
import type {
  AchievementFeedCard,
  AchievementFeedView,
  AchievementProvider,
  CollectionMeta,
} from "./types";

// The community hub's read (`GET /achievements/feed`) and its URL state:
// `?view=` (Latest or Highlights), `?provider=` and `?page=`.
//
// The feed carries `viewer_unlocked` on every Unlock, so the body differs per
// member. Next's Data Cache key includes the request headers (the member's
// Authorization), so the short revalidate below never shares one member's
// spoiler state with another.

export const ACHIEVEMENTS_HUB_PATH = "/achievements";
const FEED_PER = 30;
const FEED_FETCH: RequestInit = { next: { revalidate: 60 } };

export interface AchievementFeedFilters {
  view: AchievementFeedView;
  provider: AchievementProvider | null;
  page: number;
}

export const FEED_VIEW_OPTIONS: { value: AchievementFeedView; label: string }[] = [
  { value: "latest", label: "Latest" },
  { value: "highlights", label: "Highlights" },
];

// The API 422s on an unknown view or provider, so anything else falls back
// to the default rather than reaching it.
export function parseFeedFilters(raw: RawSearchParams): AchievementFeedFilters {
  const view = firstParam(raw.view);
  const provider = firstParam(raw.provider);
  const page = parseInt(firstParam(raw.page) ?? "", 10);
  return {
    view: view === "highlights" ? "highlights" : "latest",
    provider: isAchievementProvider(provider) ? provider : null,
    page: Number.isFinite(page) && page > 1 ? page : 1,
  };
}

// Defaults stay off the query string, so the canonical URL is the bare path.
// Changing the view or the Provider passes `page: 1`; paging keeps both.
export function feedHref(
  filters: AchievementFeedFilters,
  change: Partial<AchievementFeedFilters> = {},
): string {
  const next = { ...filters, ...change };
  const ps = new URLSearchParams();
  if (next.view !== "latest") ps.set("view", next.view);
  if (next.provider) ps.set("provider", next.provider);
  if (next.page > 1) ps.set("page", String(next.page));
  return `${ACHIEVEMENTS_HUB_PATH}${ps.size ? `?${ps}` : ""}`;
}

export function hasFeedFilters(filters: AchievementFeedFilters): boolean {
  return filters.provider != null;
}

export interface AchievementFeedPage {
  cards: AchievementFeedCard[];
  meta: CollectionMeta | null;
}

// null when the read failed, so the page can tell an outage from an empty
// hub.
export async function fetchAchievementFeed(
  filters: AchievementFeedFilters,
): Promise<AchievementFeedPage | null> {
  const ps = new URLSearchParams({
    view: filters.view,
    page: String(filters.page),
    per: String(FEED_PER),
  });
  if (filters.provider) ps.set("provider", filters.provider);
  try {
    const res = await apiFetch(`/api/v1/achievements/feed?${ps}`, FEED_FETCH);
    if (!res.ok) return null;
    const body = (await res.json()) as {
      data?: AchievementFeedCard[];
      meta?: CollectionMeta;
    };
    return { cards: body.data ?? [], meta: body.meta ?? null };
  } catch {
    return null;
  }
}

// The UTC day a card belongs to (YYYY-MM-DD), or null for Unlocks the
// Provider gave no time for. A group card already carries its `day`.
export function feedCardDay(card: AchievementFeedCard): string | null {
  if (card.kind === "group") {
    return isUnknownUnlockDate(`${card.day}T00:00:00Z`) ? null : card.day;
  }
  return isUnknownUnlockDate(card.unlocked_at)
    ? null
    : card.unlocked_at.slice(0, 10);
}

export interface FeedDay {
  // YYYY-MM-DD (UTC), or null for "unknown date".
  day: string | null;
  cards: AchievementFeedCard[];
}

// Splits the feed, newest first as the API serves it, into runs of one UTC
// day. Runs are consecutive, so the API's order holds and unknown-date cards
// (which it sorts last) close the page.
export function groupFeedByDay(cards: AchievementFeedCard[]): FeedDay[] {
  const days: FeedDay[] = [];
  for (const card of cards) {
    const day = feedCardDay(card);
    const last = days.at(-1);
    if (last && last.day === day) last.cards.push(card);
    else days.push({ day, cards: [card] });
  }
  return days;
}
