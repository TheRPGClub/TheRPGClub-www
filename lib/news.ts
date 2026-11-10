import { firstParam, type RawSearchParams } from "@/lib/search-params";

// The News Hub (spec api#355) as the News page reads it: the News Item and
// News Category shapes from `GET /api/v1/news_items` and
// `GET /api/v1/news_categories`, the page's URL state, day bands, and what a
// card shows. Client-safe and pure: no server imports, `now` passed in.

export type NewsCategoryKey =
  | "announcements"
  | "releases"
  | "emulation"
  | "industry"
  | "hardware"
  | "rumours"
  | "general";

export interface NewsCategory {
  key: NewsCategoryKey;
  name: string;
  position: number;
}

export interface NewsItemLink {
  url: string;
  title: string | null;
  site_name: string | null;
  description: string | null;
  // The outside site's own image. Never renewed; if it stops working, show
  // no image.
  image_url: string | null;
}

export interface NewsItemImage {
  // A Discord attachment address; null while `unavailable`.
  url: string | null;
  // Expired and being renewed by the bot: show a placeholder.
  unavailable: boolean;
}

export interface NewsItem {
  message_id: string;
  // Always set in the member feed.
  category_key: NewsCategoryKey | null;
  origin: "live" | "import";
  comment: string | null;
  posted_at: string;
  edited_at: string | null;
  link: NewsItemLink | null;
  images: NewsItemImage[];
  author: { user_id: string; name: string; member: boolean };
}

// The News Category keys in the API's order (positions 1-7). Names come from
// `GET /news_categories`; the keys are what the address may carry, so a key
// the API would refuse never reaches it.
export const NEWS_CATEGORY_KEYS: readonly NewsCategoryKey[] = [
  "announcements",
  "releases",
  "emulation",
  "industry",
  "hardware",
  "rumours",
  "general",
];

function isNewsCategoryKey(value: string): value is NewsCategoryKey {
  return (NEWS_CATEGORY_KEYS as readonly string[]).includes(value);
}

// ---------------------------------------------------------------------------
// URL state: the chosen News Categories (`?category=releases,industry`, in
// category order), the search (`?q=`) and the page. Both filters are applied
// by the API. Changing either returns to page one; paging keeps both.

export const NEWS_PATH = "/news";

export interface NewsFilters {
  page: number;
  // Chosen News Categories in category order; empty = the member's default
  // view (every category but the ones they switched off).
  categories: NewsCategoryKey[];
  // Search text, trimmed; "" = no search.
  q: string;
}

// Keeps known keys in category order, once each. Takes the comma list this
// page writes and repeated `category=` params alike (a GET form without JS
// sends the comma list too).
function parseCategories(raw: string | string[] | undefined): NewsCategoryKey[] {
  const values = (Array.isArray(raw) ? raw : raw ? [raw] : [])
    .flatMap((value) => value.split(","))
    .map((value) => value.trim().toLowerCase());
  return NEWS_CATEGORY_KEYS.filter((key) => values.includes(key));
}

export function parseNewsFilters(raw: RawSearchParams): NewsFilters {
  const page = parseInt(firstParam(raw.page) ?? "", 10);
  return {
    page: Number.isFinite(page) && page > 1 ? page : 1,
    categories: parseCategories(raw.category),
    q: (firstParam(raw.q) ?? "").trim(),
  };
}

export function hasNewsFilters(filters: NewsFilters): boolean {
  return filters.categories.length > 0 || filters.q !== "";
}

// Defaults stay off the query string, so the canonical URL is the bare path.
// A change to the categories or the search goes back to page one unless the
// change names a page.
export function newsHref(filters: NewsFilters, change: Partial<NewsFilters> = {}): string {
  const refilters = "categories" in change || "q" in change;
  const next = { ...filters, ...(refilters ? { page: 1 } : {}), ...change };
  const ps = new URLSearchParams();
  if (next.categories.length) ps.set("category", next.categories.join(","));
  const q = next.q.trim();
  if (q) ps.set("q", q);
  if (next.page > 1) ps.set("page", String(next.page));
  // Keys never hold a comma of their own, and a literal comma is valid in a
  // query, so the list reads "releases,industry" rather than "%2C".
  const query = ps.toString().replaceAll("%2C", ",");
  return `${NEWS_PATH}${query ? `?${query}` : ""}`;
}

// The chosen categories with `key` added or taken away, in category order.
export function toggleNewsCategory(
  chosen: readonly NewsCategoryKey[],
  key: NewsCategoryKey,
): NewsCategoryKey[] {
  const on = !chosen.includes(key);
  return NEWS_CATEGORY_KEYS.filter((k) => (k === key ? on : chosen.includes(k)));
}

// One row of the category rail.
export interface NewsCategoryRow {
  key: NewsCategoryKey;
  name: string;
  // In the chosen set (the toggle's pressed state).
  chosen: boolean;
  // Shown by the current view: chosen, or, with nothing chosen, not switched
  // off by the member. Fills the ink square; otherwise it is outlined.
  inView: boolean;
  // Switched off by the member in settings.
  hidden: boolean;
  // The count for the current search, or "hidden by you" for a switched-off
  // category until it is chosen; null when the feed sent no counts.
  note: string | null;
  // The chosen set after toggling this row, and its address.
  next: NewsCategoryKey[];
  href: string;
}

export function newsCategoryRows(
  categories: readonly NewsCategory[],
  filters: NewsFilters,
  counts: Partial<Record<string, number>> | null,
  hidden: readonly string[],
): NewsCategoryRow[] {
  const anyChosen = filters.categories.length > 0;
  return categories
    .filter((category) => isNewsCategoryKey(category.key))
    .map(({ key, name }) => {
      const chosen = filters.categories.includes(key);
      const isHidden = hidden.includes(key);
      const count = counts?.[key];
      const next = toggleNewsCategory(filters.categories, key);
      return {
        key,
        name,
        chosen,
        inView: anyChosen ? chosen : !isHidden,
        hidden: isHidden,
        note: isHidden && !chosen ? "hidden by you" : count == null ? null : String(count),
        next,
        href: newsHref(filters, { categories: next }),
      };
    });
}

// The empty state's line when a filter or search finds nothing. Category
// names come in category order; past two they are counted instead.
// `elsewhere`: the search does match items in categories the member's
// default view leaves out (their switched-off ones).
export function newsEmptyNote(
  filters: NewsFilters,
  nameOf: (key: NewsCategoryKey) => string,
  elsewhere = false,
): string {
  const { categories, q } = filters;
  const quoted = `“${q}”`;
  if (categories.length === 0) {
    return elsewhere
      ? `Nothing in the News Categories you follow matches ${quoted}.`
      : `Nothing matches ${quoted}.`;
  }
  const where =
    categories.length > 2
      ? `the ${categories.length} chosen categories`
      : categories.map(nameOf).join(" or ");
  return q ? `Nothing in ${where} matches ${quoted}.` : `Nothing in ${where} yet.`;
}

// "212 items · page 1 of 18" beside the page title; null with nothing to count.
export function countNote(total: number, page: number, pages: number): string | null {
  if (total <= 0) return null;
  const items = `${total} ${total === 1 ? "item" : "items"}`;
  return pages > 1 ? `${items} · page ${page} of ${pages}` : items;
}

// ---------------------------------------------------------------------------
// Day bands. Days and clocks are UTC, as in the Achievement Hub: the page is
// rendered on the server, which doesn't know the viewer's zone.

export interface NewsDay {
  // YYYY-MM-DD, UTC.
  day: string;
  items: NewsItem[];
}

function utcDay(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}

// Splits the feed, newest first as the API serves it, into runs of one UTC
// day. Runs are consecutive, so the API's order holds.
export function groupNewsByDay(items: NewsItem[]): NewsDay[] {
  const days: NewsDay[] = [];
  for (const item of items) {
    const day = utcDay(item.posted_at);
    const last = days.at(-1);
    if (last && last.day === day) last.items.push(item);
    else days.push({ day, items: [item] });
  }
  return days;
}

const DAY_DATE = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

const DAY_DATE_YEAR = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

// A day band's Anton title and the label beside it. Today and yesterday are
// named and dated in the label; older days are dated in the title (with the
// year once it isn't this one) and the label keeps the count. `count` is null
// for a day that runs over a page break, whose tally would be partial.
export function dayHeading(
  day: string,
  count: number | null,
  now: Date,
): { title: string; note: string | null } {
  const date = new Date(`${day}T00:00:00Z`);
  const today = now.toISOString().slice(0, 10);
  const yesterday = new Date(Date.parse(`${today}T00:00:00Z`) - 86_400_000)
    .toISOString()
    .slice(0, 10);
  const tally = count == null ? null : `${count} ${count === 1 ? "item" : "items"}`;
  const dated = (format: Intl.DateTimeFormat) => format.format(date).replace(",", "");
  const withTally = (date: string) => (tally ? `${date} · ${tally}` : date);
  if (day === today) return { title: "Today", note: withTally(dated(DAY_DATE)) };
  if (day === yesterday) return { title: "Yesterday", note: withTally(dated(DAY_DATE)) };
  const sameYear = day.slice(0, 4) === today.slice(0, 4);
  return { title: dated(sameYear ? DAY_DATE : DAY_DATE_YEAR), note: tally };
}

const CLOCK = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
  timeZone: "UTC",
});

// ---------------------------------------------------------------------------
// News inks: one colour per News Category, on news surfaces only (the News
// page, its cards and filter, and the category switches on /settings).
// Rumours is the one drawn dashed, because it is unconfirmed. Type on an ink
// is ink. Unknown keys read as General.
//
// Tailwind v4 emits a theme colour only when the source names it, so each
// variable below stays spelled out in full (never built from the key).

const NEWS_INK: Record<NewsCategoryKey, string> = {
  announcements: "var(--color-news-announcements)",
  releases: "var(--color-news-releases)",
  emulation: "var(--color-news-emulation)",
  industry: "var(--color-news-industry)",
  hardware: "var(--color-news-hardware)",
  rumours: "var(--color-news-rumours)",
  general: "var(--color-news-general)",
};

export function newsInk(key: string | null): { color: string; dashed: boolean } {
  const known = key != null && key in NEWS_INK;
  return {
    color: known ? NEWS_INK[key as NewsCategoryKey] : NEWS_INK.general,
    dashed: key === "rumours",
  };
}

// The short tag a card wears ("Announcements & Trailers" -> "Announcements").
export function categoryTag(name: string): string {
  return name.split(" & ")[0];
}

// ---------------------------------------------------------------------------
// What a card shows.

export interface NewsFrame {
  url: string | null;
  unavailable: boolean;
}

export interface NewsCardView {
  // The Barlow headline: the link's title, else its address; an image-only
  // News Item's comment; null for an image-only item without one.
  headline: string | null;
  // Where the headline (and the art) lead: the outside page. Null for an
  // image-only item, whose frames each open their image.
  href: string | null;
  description: string | null;
  // The member's comment under the headline; null when it is the headline.
  comment: string | null;
  // The meta line's left: the site, or "Image" / "3 images".
  site: string;
  // The art: the outside page's image, else the attachments.
  frames: NewsFrame[];
  // True when each frame opens its own image full size (image-only items).
  framesOpen: boolean;
  // Set in Anton on the art box when there is no art to show: the title,
  // else the site, never a whole address.
  fallback: string;
  // The poster's clock, "14:20" (UTC).
  time: string;
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

// "https://www.example.com/news/story/" -> "example.com/news/story".
function displayUrl(url: string): string {
  try {
    const u = new URL(url);
    const path = u.pathname.replace(/\/+$/, "");
    return `${u.hostname.replace(/^www\./, "")}${path}`;
  } catch {
    return url;
  }
}

function present(text: string | null | undefined): string | null {
  const trimmed = text?.trim();
  return trimmed ? trimmed : null;
}

export function newsCardView(item: NewsItem): NewsCardView {
  const comment = present(item.comment);
  const images: NewsFrame[] = item.images.map(({ url, unavailable }) => ({ url, unavailable }));
  const time = CLOCK.format(new Date(item.posted_at));
  const { link } = item;

  if (link) {
    const headline = present(link.title) ?? displayUrl(link.url);
    return {
      headline,
      href: link.url,
      description: present(link.description),
      comment,
      site: present(link.site_name) ?? hostOf(link.url),
      frames: link.image_url ? [{ url: link.image_url, unavailable: false }] : images,
      framesOpen: false,
      fallback: present(link.title) ?? present(link.site_name) ?? hostOf(link.url),
      time,
    };
  }

  return {
    headline: comment,
    href: null,
    description: null,
    comment: null,
    site: images.length > 1 ? `${images.length} images` : "Image",
    frames: images,
    framesOpen: true,
    fallback: "Image unavailable",
    time,
  };
}

// Splits a headline before its last word, so an icon set after it can stay
// on that word's line.
export function splitLastWord(text: string): [string, string] {
  const at = text.lastIndexOf(" ");
  return at < 0 ? ["", text] : [text.slice(0, at + 1), text.slice(at + 1)];
}
