import { splitCatchup, type CatchupMarkMeta } from "@/lib/news-catchup";

// The News Mark (spec api#494, ticket www#222, fix pass): the moment up to
// which a member has seen the News Hub. The unfiltered Catch-up moves it
// forward to the newest `listed_at` it showed over the visit when the member
// leaves or hides the tab (a beacon to NEWS_MARK_PATH), and Mark all seen
// moves it to now. The API only ever moves it forward. Client-safe and pure.

// The website's route handler the beacon posts to; it carries the session
// to the API's `PUT /users/:id/news_mark`.
export const NEWS_MARK_PATH = "/api/news/mark";

// The beacon's body: the newest shown News Item's `listed_at`, exactly as
// the API gave it (microseconds matter: that item must count as seen).
export interface NewsMarkBeacon {
  news_mark: string;
}

// An ISO 8601 instant with a date, a time and an offset ("Z" or +hh:mm).
const ISO_INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,9})?)?(Z|[+-]\d{2}:?\d{2})$/;

export function isIsoInstant(value: unknown): value is string {
  return typeof value === "string" && ISO_INSTANT.test(value) && !Number.isNaN(Date.parse(value));
}

// The beacon's body read back by the route handler; null for anything else.
export function readNewsMarkBeacon(body: unknown): NewsMarkBeacon | null {
  if (!body || typeof body !== "object") return null;
  const mark = (body as { news_mark?: unknown }).news_mark;
  return isIsoInstant(mark) ? { news_mark: mark } : null;
}

// Whether instant `a` is later than `b`. Date.parse stops at milliseconds,
// so a tie there falls back to the fractional digits as written.
export function isLater(a: string, b: string): boolean {
  const da = Date.parse(a);
  const db = Date.parse(b);
  if (da !== db) return da > db;
  return fraction(a) > fraction(b);
}

function fraction(instant: string): string {
  return (instant.match(/\.(\d+)/)?.[1] ?? "").padEnd(9, "0");
}

// The later of two instants (either may be missing), as given.
function later(a: string | null, b: string | null): string | null {
  if (!a) return b;
  if (!b) return a;
  return isLater(b, a) ? b : a;
}

// The newest `listed_at` among the items, as given; null with none. New
// means newly listed, so this, not `posted_at`, is what the mark moves to.
export function newestListedAt(items: readonly { listed_at?: string | null }[]): string | null {
  let newest: string | null = null;
  for (const { listed_at } of items) {
    if (isIsoInstant(listed_at)) newest = later(newest, listed_at);
  }
  return newest;
}

// The newest News Item the page showed. Catch-up shows the hero, the mosaic
// and the page of Seen items (a later page shows the rows alone); Show all
// (`since`) shows its page of new items.
type Shown = { posted_at: string; listed_at?: string | null };

export function newestShown(
  meta: CatchupMarkMeta | null | undefined,
  top: readonly Shown[] | null,
  rows: readonly Shown[],
  filters: { page: number; since: string | null },
): string | null {
  if (filters.since || !top) return newestListedAt(rows);
  type Item = Parameters<typeof splitCatchup>[1][number];
  const catchup = splitCatchup(meta, top as Item[], rows as Item[], filters.page);
  return newestListedAt([
    ...(catchup.hero ? [catchup.hero] : []),
    ...catchup.mosaic,
    ...catchup.seen,
  ]);
}

// Whether this view may move the mark: the unfiltered Catch-up page one, or
// any unfiltered Show all page. The mark is one instant for every News
// Category, so a filtered or searched view never moves it, nor do the later
// pages of Seen items (nothing new there).
export function beaconEligible(view: {
  categories: readonly string[];
  q: string;
  page: number;
  since: string | null;
}): boolean {
  if (view.categories.length > 0 || view.q !== "") return false;
  return view.since !== null || view.page === 1;
}

// What the beacon knows over one visit: the visit's mark (from the address),
// the newest `listed_at` the eligible views showed, forward only, and what
// it sent already.
export interface VisitBeacon {
  mark: string | null;
  newest: string | null;
  sent: string | null;
}

// The visit after a view showed `shown` (null for nothing, or for a view
// that may not move the mark). Another mark is another visit: start over.
export function followVisit(visit: VisitBeacon | null, mark: string | null, shown: string | null): VisitBeacon {
  if (!visit || visit.mark !== mark) return { mark, newest: shown, sent: null };
  return { ...visit, newest: later(visit.newest, shown) };
}

// Whether leaving should move the mark to `newest`: there is something
// shown, it is later than the mark the page was read with (or there is no
// mark: a first visit sets one), and it isn't what was sent already.
export function shouldSendMark(
  newest: string | null,
  mark: string | null,
  sent: string | null,
): newest is string {
  if (!newest || newest === sent) return false;
  return mark === null || isLater(newest, mark);
}
