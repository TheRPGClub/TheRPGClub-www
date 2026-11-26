import { apiFetch } from "@/lib/api";
import type { NewsCategory, NewsCategoryKey, NewsFilters, NewsItem } from "@/lib/news";
import { CATCHUP_NEW_SHOWN, markOf, NEWS_ROWS_PER, type CatchupMarkMeta } from "@/lib/news-catchup";
import { newsFeedTag, type NewsCategoryPreferences } from "@/lib/news-category-preferences";
import type { CollectionMeta } from "./types";

// The News Hub's reads (spec api#355): the feed (`GET /news_items`), the
// News Category list (`GET /news_categories`) and a member's News Category
// Preferences. All belong to the News Hub Feature and 404 for a member who
// can't use it.
//
// Next's Data Cache key includes the request headers (the member's
// Authorization), so a short revalidate is still per member. The default
// view leaves out the member's switched-off News Categories, so the feed is
// tagged per member and a settings save expires it at once (newsFeedTag).
// Each feed read also carries the News Feed Stamp (`v`, which the API
// ignores), so a cached feed never outlives a change to the News Items: an
// open page that sees the stamp move re-reads the page and gets a new one.
// The feed's meta also carries the member's News Mark (api#496), so whatever
// moves the mark expires the same tag.

// The list is fixed in code on the API; it changes with an API release.
const CATEGORIES_FETCH: RequestInit = { next: { revalidate: 3600 } };

// The feed's meta (schema NewsFeedMeta): the page's counts for the filtered
// result, plus what the category rail needs.
export interface NewsFeedMeta extends CollectionMeta, CatchupMarkMeta {
  // Every News Category's count for the current search, ignoring the
  // category filter and the member's preferences.
  category_counts?: Partial<Record<NewsCategoryKey, number>>;
  // The member's switched-off categories, whatever the request filters by.
  hidden_categories?: NewsCategoryKey[];
}

export interface NewsPage {
  items: NewsItem[];
  meta: NewsFeedMeta | null;
}

// "not_found" when the API says the viewer can't use the News Hub (its flag
// changed after the page's own gate ran), null when the read failed, so the
// page can tell both from an empty feed.
type FeedRead = NewsPage | "not_found" | null;

// What Catch-up reads (ticket www#221). `top`: page one of the whole view,
// the hero and the mosaic, whose meta carries the member's News Mark and new
// counts (api#496). `rows`: the page of Seen rows, the view up to the mark
// (`until`), or the whole view without one. Show all (`filters.since`)
// reads only the new list, a page at a time, into `rows`.
export interface CatchupRead {
  top: FeedRead;
  rows: FeedRead;
}

export async function fetchCatchup(
  filters: NewsFilters,
  // The viewer's Discord id, for the feed's cache tag.
  userId: string,
  // The News Feed Stamp read before the feed, or null.
  stamp: string | null,
): Promise<CatchupRead> {
  const read = (page: number, per: number, bounds: Bounds = {}) =>
    readFeed(filters, userId, stamp, page, per, bounds);
  if (filters.since) {
    return { top: null, rows: await read(filters.page, NEWS_ROWS_PER, { since: filters.since }) };
  }
  const top = await read(1, CATCHUP_NEW_SHOWN);
  if (top === "not_found" || top === null) return { top, rows: top };
  // The mark goes back exactly as the API gave it (microseconds), so the
  // item it was set from counts as seen.
  const mark = markOf(top.meta);
  const rows = await read(filters.page, NEWS_ROWS_PER, mark ? { until: mark } : {});
  return { top, rows };
}

interface Bounds {
  since?: string;
  until?: string;
}

async function readFeed(
  filters: NewsFilters,
  userId: string,
  stamp: string | null,
  page: number,
  per: number,
  bounds: Bounds,
): Promise<FeedRead> {
  const ps = new URLSearchParams({ page: String(page), per: String(per) });
  if (bounds.since) ps.set("since", bounds.since);
  if (bounds.until) ps.set("until", bounds.until);
  // No category = the member's default view, which the API works out.
  if (filters.categories.length) ps.set("category", filters.categories.join(","));
  if (filters.q) ps.set("q", filters.q);
  if (stamp) ps.set("v", stamp);
  try {
    const res = await apiFetch(`/api/v1/news_items?${ps}`, {
      next: { revalidate: 60, tags: [newsFeedTag(userId)] },
    });
    if (res.status === 404) return "not_found";
    if (!res.ok) return null;
    const body = (await res.json()) as { data?: NewsItem[]; meta?: NewsFeedMeta };
    return { items: body.data ?? [], meta: body.meta ?? null };
  } catch {
    return null;
  }
}

// The News Feed Stamp (`GET /api/v1/news_items/stamp`): changes whenever a
// News Item does. Answered from a file on the API machine, never the
// database, and without the member's session; null when the read failed.
export async function fetchNewsStamp(): Promise<string | null> {
  try {
    const res = await apiFetch("/api/v1/news_items/stamp", { cache: "no-store" });
    if (!res.ok) return null;
    const body = (await res.json()) as { data?: { stamp?: string } };
    return body.data?.stamp ?? null;
  } catch {
    return null;
  }
}

// The News Categories in the API's order; empty when the read failed (cards
// then fall back to their key for the tag, and the rail lists nothing).
export async function fetchNewsCategories(): Promise<NewsCategory[]> {
  try {
    const res = await apiFetch("/api/v1/news_categories", CATEGORIES_FETCH);
    if (!res.ok) return [];
    const body = (await res.json()) as { data?: NewsCategory[] };
    return [...(body.data ?? [])].sort((a, b) => a.position - b.position);
  } catch {
    return [];
  }
}

// A member's News Category Preferences for /settings, read fresh: a flip in
// another tab shows on the next load. Null when the read failed.
export async function fetchNewsCategoryPreferences(
  userId: string,
): Promise<NewsCategoryPreferences | null> {
  try {
    const res = await apiFetch(
      `/api/v1/users/${encodeURIComponent(userId)}/news_category_preferences`,
      { cache: "no-store" },
    );
    if (!res.ok) return null;
    const body = (await res.json()) as { data?: NewsCategoryPreferences };
    return body.data ?? null;
  } catch {
    return null;
  }
}
