import { apiFetch } from "@/lib/api";
import type { NewsCategory, NewsCategoryKey, NewsFilters, NewsItem } from "@/lib/news";
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

const NEWS_PER = 30;
// The list is fixed in code on the API; it changes with an API release.
const CATEGORIES_FETCH: RequestInit = { next: { revalidate: 3600 } };

// The feed's meta (schema NewsFeedMeta): the page's counts for the filtered
// result, plus what the category rail needs.
export interface NewsFeedMeta extends CollectionMeta {
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
export async function fetchNews(
  filters: NewsFilters,
  // The viewer's Discord id, for the feed's cache tag.
  userId: string,
): Promise<NewsPage | "not_found" | null> {
  return readFeed(filters, userId, filters.page, NEWS_PER);
}

// The items just past the page's two edges: the last of the page before
// (null on page one) and the first of the page after (null past the end), so
// a day band at an edge knows whether the day runs over the break. Each is
// one item read on its own (`per=1`, whose page number is its position);
// undefined when that read failed.
export async function fetchNewsNeighbours(
  filters: NewsFilters,
  userId: string,
): Promise<{ before: NewsItem | null | undefined; after: NewsItem | null | undefined }> {
  const at = async (position: number) => {
    if (position < 1) return null;
    const page = await readFeed(filters, userId, position, 1);
    return page && page !== "not_found" ? (page.items[0] ?? null) : undefined;
  };
  const [before, after] = await Promise.all([
    at((filters.page - 1) * NEWS_PER),
    at(filters.page * NEWS_PER + 1),
  ]);
  return { before, after };
}

async function readFeed(
  filters: NewsFilters,
  userId: string,
  page: number,
  per: number,
): Promise<NewsPage | "not_found" | null> {
  const ps = new URLSearchParams({ page: String(page), per: String(per) });
  // No category = the member's default view, which the API works out.
  if (filters.categories.length) ps.set("category", filters.categories.join(","));
  if (filters.q) ps.set("q", filters.q);
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
