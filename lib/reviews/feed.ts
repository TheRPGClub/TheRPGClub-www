// The Review Feed (/reviews, spec api#430): every member's Published Reviews
// and Revisions, newest published first, in UTC day bands. The API serves
// the list (GET /api/v1/reviews, ReviewFeedEntry); this module reads the
// address, groups the entries into days and words each box's parts.
// Client-safe: no server imports.
import type { Game, ReviewBody, User } from "@/lib/api/types";
import { firstParam, type RawSearchParams } from "@/lib/search-params";

// Two-up boxes, so an even page; 20 a page as the mock's 1,284 over 64.
export const FEED_PER_PAGE = 20;

export interface ReviewFeedEntry {
  kind: "review" | "revision";
  review_id: number;
  revision_id?: number | null;
  user_id: string;
  gamedb_game_id: number;
  rating: number;
  // The score a Revision replaced; null on a Review.
  previous_rating?: number | null;
  title?: string | null;
  body: ReviewBody;
  // The body holds text; false for a score-only quick take.
  written: boolean;
  published_at: string;
  edited_at?: string | null;
  created_at: string;
  user?: Pick<User, "user_id" | "username" | "global_name"> | null;
  game?: Pick<Game, "game_id" | "title" | "cover_url" | "gotm_won" | "nr_gotm_won"> | null;
}

export interface FeedQuery {
  page: number;
  // Written only: score-only quick takes left out.
  written: boolean;
}

export function parseFeedQuery(raw: RawSearchParams): FeedQuery {
  const page = parseInt(firstParam(raw.page) ?? "", 10);
  const written = firstParam(raw.written);
  return {
    page: Number.isFinite(page) && page > 1 ? page : 1,
    written: written === "1" || written === "true",
  };
}

// The feed's address for `query` with `change` applied; the defaults stay
// out of it, so the bare feed is /reviews.
export function feedHref(query: FeedQuery, change: Partial<FeedQuery> = {}): string {
  const next = { ...query, ...change };
  const params = new URLSearchParams();
  if (next.written) params.set("written", "1");
  if (next.page > 1) params.set("page", String(next.page));
  const qs = params.toString();
  return qs ? `/reviews?${qs}` : "/reviews";
}

// "1,284 published", or "312 written" with Written only on.
export function feedCountNote(total: number, written: boolean): string {
  return `${total.toLocaleString("en-GB")} ${written ? "written" : "published"}`;
}

// ---------------------------------------------------------------------------
// Day bands, in UTC: the page is rendered on the server, which doesn't know
// the viewer's zone (as on the News page).

export interface FeedDay {
  // YYYY-MM-DD, UTC.
  day: string;
  entries: ReviewFeedEntry[];
}

export function utcDay(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}

// Runs of one UTC day, in the API's order.
export function groupFeedByDay(entries: readonly ReviewFeedEntry[]): FeedDay[] {
  const days: FeedDay[] = [];
  for (const entry of entries) {
    const day = utcDay(entry.published_at);
    const last = days.at(-1);
    if (last && last.day === day) last.entries.push(entry);
    else days.push({ day, entries: [entry] });
  }
  return days;
}

// Whether a band at a page edge runs over the break: the entry just past
// that edge falls on the same day. `neighbour` is null when there is none
// and undefined when it couldn't be read, which counts as running over, so a
// tally is never short.
export function dayRunsOver(day: string, neighbour: ReviewFeedEntry | null | undefined): boolean {
  if (neighbour === null) return false;
  return neighbour === undefined || utcDay(neighbour.published_at) === day;
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

// A band's Anton title and the label beside it: "Today" / "Mon 23 Nov · 2
// reviews"; an older day is dated in the title (with its year once it isn't
// this one). The tally reads "written" with Written only on, and is left out
// (`count` null) for a day that runs over a page break.
export function feedDayHeading(
  day: string,
  count: number | null,
  now: Date,
  written = false,
): { title: string; note: string | null } {
  const date = new Date(`${day}T00:00:00Z`);
  const today = now.toISOString().slice(0, 10);
  const yesterday = new Date(Date.parse(`${today}T00:00:00Z`) - 86_400_000).toISOString().slice(0, 10);
  const noun = written ? "written" : count === 1 ? "review" : "reviews";
  const tally = count == null ? null : `${count} ${noun}`;
  const dated = (format: Intl.DateTimeFormat) => format.format(date).replace(",", "");
  const withTally = (label: string) => (tally ? `${label} · ${tally}` : label);
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

// "09:14", UTC.
export function feedClock(iso: string): string {
  return CLOCK.format(new Date(iso));
}

// ---------------------------------------------------------------------------
// A box's parts.

export type FeedTrack = "gotm" | "nr" | null;

// The game's club track: GOTM first for a game that won both.
export function feedTrack(entry: ReviewFeedEntry): FeedTrack {
  if (entry.game?.gotm_won) return "gotm";
  if (entry.game?.nr_gotm_won) return "nr";
  return null;
}

export const TRACK_PILL: Record<"gotm" | "nr", string> = { gotm: "GOTM", nr: "NR-GOTM" };

// The state pill after the track pill: a Revision is Revisited, a score-only
// take is a Quick take, a written Review has none.
export function feedState(entry: ReviewFeedEntry): "revisited" | "quick" | null {
  if (entry.kind === "revision") return "revisited";
  if (!entry.written) return "quick";
  return null;
}

// The score a Revision replaced, struck beside the new one.
export function previousScore(entry: ReviewFeedEntry): number | null {
  return entry.kind === "revision" && entry.previous_rating != null ? entry.previous_rating : null;
}
