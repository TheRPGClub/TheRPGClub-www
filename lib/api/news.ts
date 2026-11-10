import { apiFetch } from "@/lib/api";
import type { NewsCategory, NewsFilters, NewsItem } from "@/lib/news";
import type { CollectionMeta } from "./types";

// The News Hub's reads (spec api#355): the feed (`GET /news_items`) and the
// News Category list (`GET /news_categories`). Both belong to the News Hub
// Feature and 404 for a member who can't use it.
//
// Next's Data Cache key includes the request headers (the member's
// Authorization), so a short revalidate is still per member; the feed will
// carry each member's own default view once News Category Preferences land.

const NEWS_PER = 30;
const NEWS_FETCH: RequestInit = { next: { revalidate: 60 } };
// The list is fixed in code on the API; it changes with an API release.
const CATEGORIES_FETCH: RequestInit = { next: { revalidate: 3600 } };

export interface NewsPage {
  items: NewsItem[];
  meta: CollectionMeta | null;
}

// "not_found" when the API says the viewer can't use the News Hub (its flag
// changed after the page's own gate ran), null when the read failed, so the
// page can tell both from an empty feed.
export async function fetchNews(
  filters: NewsFilters,
): Promise<NewsPage | "not_found" | null> {
  const ps = new URLSearchParams({ page: String(filters.page), per: String(NEWS_PER) });
  try {
    const res = await apiFetch(`/api/v1/news_items?${ps}`, NEWS_FETCH);
    if (res.status === 404) return "not_found";
    if (!res.ok) return null;
    const body = (await res.json()) as { data?: NewsItem[]; meta?: CollectionMeta };
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
