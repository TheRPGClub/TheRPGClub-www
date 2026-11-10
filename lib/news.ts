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

// ---------------------------------------------------------------------------
// URL state. `?page=` only for now; the category filter and search join it
// in www#77, and changing either passes `page: 1`.

export const NEWS_PATH = "/news";

export interface NewsFilters {
  page: number;
}

export function parseNewsFilters(raw: RawSearchParams): NewsFilters {
  const page = parseInt(firstParam(raw.page) ?? "", 10);
  return { page: Number.isFinite(page) && page > 1 ? page : 1 };
}

// Defaults stay off the query string, so the canonical URL is the bare path.
export function newsHref(filters: NewsFilters, change: Partial<NewsFilters> = {}): string {
  const next = { ...filters, ...change };
  const ps = new URLSearchParams();
  if (next.page > 1) ps.set("page", String(next.page));
  return `${NEWS_PATH}${ps.size ? `?${ps}` : ""}`;
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
// year once it isn't this one) and the label keeps the count.
export function dayHeading(
  day: string,
  count: number,
  now: Date,
): { title: string; note: string } {
  const date = new Date(`${day}T00:00:00Z`);
  const today = now.toISOString().slice(0, 10);
  const yesterday = new Date(Date.parse(`${today}T00:00:00Z`) - 86_400_000)
    .toISOString()
    .slice(0, 10);
  const tally = `${count} ${count === 1 ? "item" : "items"}`;
  const dated = (format: Intl.DateTimeFormat) => format.format(date).replace(",", "");
  if (day === today) return { title: "Today", note: `${dated(DAY_DATE)} · ${tally}` };
  if (day === yesterday) return { title: "Yesterday", note: `${dated(DAY_DATE)} · ${tally}` };
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
  // Set in Anton on the art box when there is no art to show.
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
      fallback: headline,
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
