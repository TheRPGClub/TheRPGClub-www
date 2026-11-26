import { NEWS_CATEGORY_KEYS, type NewsCategoryKey, type NewsItem } from "@/lib/news";

// Shelves, the News page's second tab (spec api#494, ticket www#223): the
// shelves read's shape, the lead row taken from it, the closing line's
// switched-off categories and the sideways rows' scroll arithmetic.
// Client-safe and pure.

// The newest News Items each shelf asks for (`per`; the API allows 20).
export const SHELF_PER = 10;
// The lead row's wide art cards.
export const LEAD_COUNT = 3;

// One shelf of `GET /api/v1/news_items/shelves` (schema NewsShelf): a News
// Category in the member's default view, its newest items and how many
// were posted today (UTC).
export interface NewsShelf {
  category_key: NewsCategoryKey;
  name: string;
  today_count: number;
  items: NewsItem[];
}

export interface NewsShelvesMeta {
  per: number;
  // The member's switched-off News Categories, which get no shelf.
  hidden_categories: NewsCategoryKey[];
}

export interface NewsShelves {
  shelves: NewsShelf[];
  meta: NewsShelvesMeta;
}

// The lead row: the newest News Items across the member's default view,
// newest first. The shelves hold every category's newest, so the view's
// newest are among them; an item is listed once.
export function leadItems(shelves: readonly NewsShelf[], count = LEAD_COUNT): NewsItem[] {
  const seen = new Set<string>();
  const all: NewsItem[] = [];
  for (const { items } of shelves) {
    for (const item of items) {
      if (seen.has(item.message_id)) continue;
      seen.add(item.message_id);
      all.push(item);
    }
  }
  return all
    .sort((a, b) => Date.parse(b.posted_at) - Date.parse(a.posted_at))
    .slice(0, count);
}

// "Rumours & Leaks and General": the switched-off categories the closing
// line names, in News Category order; null with none.
export function switchedOffNames(
  hidden: readonly string[],
  nameOf: (key: string | null) => string,
): string | null {
  const names = NEWS_CATEGORY_KEYS.filter((key) => hidden.includes(key)).map(nameOf);
  if (names.length === 0) return null;
  if (names.length === 1) return names[0];
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

// Whether a sideways row can go back or on from where it stands. A pixel
// of slack: zoom and fractional widths leave the end a hair short.
export function shelfScroll(
  left: number,
  scrollWidth: number,
  clientWidth: number,
): { prev: boolean; next: boolean } {
  return { prev: left > 1, next: left + clientWidth < scrollWidth - 1 };
}

// How far an arrow moves a row: the whole cards that fit in view (`card` is
// a card's width plus the gap), at least one; without a card, a view.
export function shelfStep(clientWidth: number, card: number): number {
  if (card <= 0) return clientWidth;
  return Math.max(1, Math.floor(clientWidth / card)) * card;
}
