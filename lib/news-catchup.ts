import {
  categoryTag,
  NEWS_CATEGORY_KEYS,
  newsCardView,
  newsInk,
  type NewsCategoryKey,
  type NewsItem,
} from "@/lib/news";

// Catch-up, the News page's first view (spec api#494, ticket www#221): which
// News Items are new since the member's News Mark, the hero, the mosaic and
// how each tile is sized, and the Seen rows. Client-safe and pure: `now` is
// passed in, days and clocks are UTC (the page is rendered on the server).

// The hero plus up to nine mosaic tiles read from the top of the view.
export const CATCHUP_NEW_SHOWN = 10;
// One page of Seen rows, or of the full new list (Show all).
export const NEWS_ROWS_PER = 30;

// ---------------------------------------------------------------------------
// The split. `top` is page one of the whole view (newest first, at most
// CATCHUP_NEW_SHOWN); `rows` is the page of Seen rows: everything up to the
// mark, or the whole view without one.

export type CatchupState = "new" | "caught_up" | "first_visit";

export interface CatchupMarkMeta {
  // The member's News Mark, null without one (api#496). Absent from an API
  // older than api#496: read as no mark, so the page degrades to the
  // first-visit state.
  news_mark?: string | null;
  new_count?: number;
  new_category_counts?: Partial<Record<NewsCategoryKey, number>>;
}

export interface Catchup {
  state: CatchupState;
  mark: string | null;
  newCount: number;
  newByCategory: Partial<Record<NewsCategoryKey, number>>;
  // The newest new News Item, else the newest in the view; null on a later
  // page or with nothing to show.
  hero: NewsItem | null;
  // The new News Items after the hero, up to nine.
  mosaic: NewsItem[];
  // New News Items past the mosaic ("+N more new").
  moreNew: number;
  seen: NewsItem[];
}

// The mark the page reads from the feed's meta: a mark only counts when the
// API also sent its counts.
export function markOf(meta: CatchupMarkMeta | null | undefined): string | null {
  if (!meta || typeof meta.new_count !== "number") return null;
  return meta.news_mark ?? null;
}

export function splitCatchup(
  meta: CatchupMarkMeta | null | undefined,
  top: NewsItem[],
  rows: NewsItem[],
  page: number,
): Catchup {
  const mark = markOf(meta);
  const newCount = mark ? (meta?.new_count ?? 0) : 0;
  const newByCategory = mark ? (meta?.new_category_counts ?? {}) : {};
  const state: CatchupState = !mark ? "first_visit" : newCount > 0 ? "new" : "caught_up";
  const first = page === 1;
  if (state === "new") {
    const fresh = top.slice(0, Math.min(newCount, CATCHUP_NEW_SHOWN));
    return {
      state, mark, newCount, newByCategory,
      hero: first ? (fresh[0] ?? null) : null,
      mosaic: first ? fresh.slice(1) : [],
      moreNew: Math.max(0, newCount - fresh.length),
      seen: rows,
    };
  }
  // Nothing new: the newest item stays the hero, and the Seen rows follow
  // it (page one leaves it out, so it isn't listed twice).
  return {
    state, mark, newCount, newByCategory,
    hero: first ? (rows[0] ?? null) : null,
    mosaic: [],
    moreNew: 0,
    seen: first ? rows.slice(1) : rows,
  };
}

// ---------------------------------------------------------------------------
// The hero band's ink bar and legend: every News Category with new items,
// in category order.

export interface InkSegment {
  key: NewsCategoryKey;
  name: string;
  count: number;
  color: string;
  dashed: boolean;
}

export function inkSegments(
  counts: Partial<Record<NewsCategoryKey, number>>,
  nameOf: (key: string | null) => string,
): InkSegment[] {
  return NEWS_CATEGORY_KEYS.flatMap((key) => {
    const count = counts[key] ?? 0;
    if (count <= 0) return [];
    return [{ key, name: categoryTag(nameOf(key)), count, ...newsInk(key) }];
  });
}

// ---------------------------------------------------------------------------
// Tiles. A tile's size follows what its News Item carries.

export type TileSize = "large" | "normal" | "quote" | "panel";

export function tileSize(item: NewsItem): TileSize {
  const view = newsCardView(item);
  const art = view.frames.some((frame) => frame.url && !frame.unavailable);
  if (art) return view.description ? "large" : "normal";
  if (view.comment) return "quote";
  return "panel";
}

// The site's initial, set large on an ink panel.
export function siteInitial(site: string): string {
  const letter = site.match(/[\p{L}\p{N}]/u)?.[0];
  return letter ? letter.toUpperCase() : "#";
}

// Places tiles on a grid of `cols` columns in reading order, row by row,
// so the keyboard order is the order on screen. A tile that would leave a
// hole shrinks to fit where it lands, and the last row is closed up by
// widening its last tile. A two-row tile that would still leave a hole at
// the foot comes down to one row, latest first. Returns each tile's 1-based
// row, column and span.
export interface TilePlace {
  row: number;
  col: number;
  w: number;
  h: number;
}

export function packTiles(sizes: TileSize[], cols: number): TilePlace[] {
  const next = [...sizes];
  for (;;) {
    const { places, holes } = packOnce(next, cols);
    const large = next.lastIndexOf("large");
    if (holes === 0 || cols < 6 || large < 0) return places;
    next[large] = "normal";
  }
}

function packOnce(sizes: TileSize[], cols: number): { places: TilePlace[]; holes: number } {
  const want = (size: TileSize): [number, number] => {
    if (cols >= 6) return size === "large" ? [2, 2] : size === "normal" ? [2, 1] : [1, 1];
    if (cols >= 2) return size === "large" ? [2, 1] : [1, 1];
    return [1, 1];
  };
  const taken = new Set<string>();
  const free = (r: number, c: number) => c <= cols && !taken.has(`${r}:${c}`);
  const places: TilePlace[] = [];
  let r = 1;
  let c = 1;
  for (const size of sizes) {
    while (!free(r, c)) {
      c += 1;
      if (c > cols) [r, c] = [r + 1, 1];
    }
    const [ww, wh] = want(size);
    let w = 1;
    while (w < ww && free(r, c + w)) w += 1;
    let h = wh;
    for (let x = c; x < c + w && h > 1; x += 1) if (!free(r + 1, x)) h = 1;
    for (let y = r; y < r + h; y += 1) for (let x = c; x < c + w; x += 1) taken.add(`${y}:${x}`);
    places.push({ row: r, col: c, w, h });
    c += w;
  }
  if (places.length === 0) return { places, holes: 0 };
  // Close up the last row: its last tile takes the free cells after it.
  const last = Math.max(...places.map((p) => p.row + p.h - 1));
  const tail = places.findLast((p) => p.row === last);
  if (tail) {
    while (free(last, tail.col + tail.w)) {
      taken.add(`${last}:${tail.col + tail.w}`);
      tail.w += 1;
    }
  }
  let holes = 0;
  for (let y = 1; y <= last; y += 1) for (let x = 1; x <= cols; x += 1) if (free(y, x)) holes += 1;
  return { places, holes };
}

// ---------------------------------------------------------------------------
// Time, in UTC.

const WEEKDAY = new Intl.DateTimeFormat("en-GB", { weekday: "long", timeZone: "UTC" });
const SHORT_DAY = new Intl.DateTimeFormat("en-GB", { weekday: "short", timeZone: "UTC" });
const DAY_MONTH = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
const DAY_MONTH_YEAR = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});
const CLOCK = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
  timeZone: "UTC",
});
const DAY_MS = 86_400_000;

function dayStart(at: number): number {
  return Math.floor(at / DAY_MS) * DAY_MS;
}

// The mark under the count: "today, 21:40", "Tuesday, 21:40" within the
// week, else "12 Nov, 21:40" (with the year once it isn't this one).
export function sinceLabel(iso: string, now: Date): string {
  const at = new Date(iso);
  const days = (dayStart(now.getTime()) - dayStart(at.getTime())) / DAY_MS;
  const clock = CLOCK.format(at);
  if (days <= 0) return `today, ${clock}`;
  if (days === 1) return `yesterday, ${clock}`;
  if (days < 7) return `${WEEKDAY.format(at)}, ${clock}`;
  const sameYear = at.getUTCFullYear() === now.getUTCFullYear();
  return `${(sameYear ? DAY_MONTH : DAY_MONTH_YEAR).format(at)}, ${clock}`;
}

// A hero's or tile's age: "now", "12 min ago", "3 h ago", then "Tue 21:40"
// within the week, then "12 Nov".
export function agoLabel(iso: string, now: Date): string {
  const at = new Date(iso);
  const ago = now.getTime() - at.getTime();
  if (ago < 60_000) return "now";
  if (ago < 3_600_000) return `${Math.floor(ago / 60_000)} min ago`;
  if (ago < DAY_MS) return `${Math.floor(ago / 3_600_000)} h ago`;
  if (ago < 7 * DAY_MS) return `${SHORT_DAY.format(at)} ${CLOCK.format(at)}`;
  return at.getUTCFullYear() === now.getUTCFullYear() ? DAY_MONTH.format(at) : DAY_MONTH_YEAR.format(at);
}

// A Seen row's day and time: "21:40" today, "Tue 21:40" within the week,
// else "12 Nov" (with the year once it isn't this one).
export function rowWhen(iso: string, now: Date): string {
  const at = new Date(iso);
  const days = (dayStart(now.getTime()) - dayStart(at.getTime())) / DAY_MS;
  if (days <= 0) return CLOCK.format(at);
  if (days < 7) return `${SHORT_DAY.format(at)} ${CLOCK.format(at)}`;
  return at.getUTCFullYear() === now.getUTCFullYear() ? DAY_MONTH.format(at) : DAY_MONTH_YEAR.format(at);
}
