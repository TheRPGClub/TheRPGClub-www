import { daysBetween, daysLeft, seasonAround, type IsoDay } from "@/lib/challenges/dates";
import type { Challenge, ChallengeFormat, ChallengeRun, PoolGame } from "@/lib/challenges/types";

// The Challenges index as a pinboard (surface brief challenges-index): up to
// two running Challenges pasted up as billboards, the rest as flyers. Pure
// and client-safe; the page reads the data (lib/api/challenges).

export const FORMATS: readonly ChallengeFormat[] = ["slots", "pool", "assignment"];

export const FORMAT_NAME: Record<ChallengeFormat, string> = {
  slots: "Slots",
  pool: "Pool",
  assignment: "Assignment",
};

export type OpenFilter = "all" | "open" | "closed";

export interface BoardFilters {
  open: OpenFilter;
  format: ChallengeFormat | null;
}

export function parseBoardFilters(params: { open?: string; format?: string }): BoardFilters {
  const open = params.open === "open" || params.open === "closed" ? params.open : "all";
  const format = FORMATS.find((f) => f === params.format) ?? null;
  return { open, format };
}

// The index's address with a filter changed; a format chip already on turns
// off.
export function boardHref(filters: BoardFilters, change: Partial<BoardFilters>): string {
  const next = { ...filters, ...change };
  const qs = new URLSearchParams();
  if (next.open !== "all") qs.set("open", next.open);
  if (next.format) qs.set("format", next.format);
  const query = qs.toString();
  return query ? `/challenges?${query}` : "/challenges";
}

export function applyFilters(challenges: readonly Challenge[], filters: BoardFilters): Challenge[] {
  return challenges.filter(
    (c) =>
      (filters.open === "all" || c.open === (filters.open === "open")) &&
      (!filters.format || c.challenge_format === filters.format),
  );
}

// "No Closed Pool Challenges." for a filter that finds nothing.
export function emptyFilterLine(filters: BoardFilters): string {
  const open = filters.open === "all" ? "" : filters.open === "open" ? "Open " : "Closed ";
  const format = filters.format ? `${FORMAT_NAME[filters.format]} ` : "";
  return `No ${open}${format}Challenges.`;
}

export interface Clock {
  days: number;
  caption: string;
}

// The deadline a billboard counts down to: a Seasonal Challenge inside its
// Season, or an Assignment Edition in sign-up or picking. Null otherwise.
export function billboardClock(challenge: Challenge, today: IsoDay): Clock | null {
  if (!challenge.open) return null;
  if (challenge.schedule === "seasonal") {
    const days = daysLeft(challenge, today);
    return days == null ? null : { days, caption: days === 1 ? "day left" : "days left" };
  }
  const edition = challenge.assignment?.edition;
  if (challenge.challenge_format === "assignment" && edition) {
    if (edition.phase === "signup") {
      const days = Math.max(daysBetween(today, edition.signup_cutoff_on), 0);
      return {
        days,
        caption: days === 1 ? "day to sign up" : "days to sign up",
      };
    }
    if (edition.phase === "picking") {
      const days = Math.max(daysBetween(today, edition.pick_deadline_on), 0);
      return { days, caption: days === 1 ? "day to pick" : "days to pick" };
    }
  }
  return null;
}

// What a flyer shows beyond the list: its Runs, a billboard's Finished
// count, and the first Pool covers.
export interface FlyerExtras {
  runCount: number | null;
  finished: number | null;
  covers: PoolGame[];
}

export interface Board {
  billboards: Challenge[];
  flyers: Challenge[];
}

// Up to two Open Challenges with a clock running become billboards, nearest
// deadline first. The rest are flyers: Open first (most Runs first), then
// Closed (soonest to open first; ended Always Open ones last).
export function arrangeBoard(
  challenges: readonly Challenge[],
  today: IsoDay,
  runCounts: ReadonlyMap<number, number> = new Map(),
): Board {
  const clocked = challenges
    .map((c) => ({ c, clock: billboardClock(c, today) }))
    .filter((x): x is { c: Challenge; clock: Clock } => x.clock !== null)
    .sort((a, b) => a.clock.days - b.clock.days || a.c.id - b.c.id)
    .slice(0, 2)
    .map((x) => x.c);
  const billboardIds = new Set(clocked.map((c) => c.id));
  const rest = challenges.filter((c) => !billboardIds.has(c.id));
  const open = rest
    .filter((c) => c.open)
    .sort((a, b) => (runCounts.get(b.id) ?? 0) - (runCounts.get(a.id) ?? 0) || b.id - a.id);
  const closed = rest
    .filter((c) => !c.open)
    .sort((a, b) => compare(opensOn(a, today), opensOn(b, today)) || b.id - a.id);
  return { billboards: clocked, flyers: [...open, ...closed] };
}

function compare(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

// When a Closed Challenge opens next, for ordering ("~" sorts an Always Open
// one that ended after every date).
function opensOn(challenge: Challenge, today: IsoDay): string {
  if (challenge.schedule === "seasonal" && challenge.season) return seasonAround(challenge.season, today).starts;
  return "~";
}

export function countLine(challenges: readonly Challenge[]): string {
  const open = challenges.filter((c) => c.open).length;
  return `${open} Open · ${challenges.length - open} Closed`;
}

// The viewer's Run of each Challenge for the board: their newest Run that is
// Active or Finished (an Abandoned or Expired one is no longer theirs to show).
export function viewerRuns(runs: readonly ChallengeRun[]): Map<number, ChallengeRun> {
  const byChallenge = new Map<number, ChallengeRun>();
  for (const run of runs) {
    if (run.status !== "active" && run.status !== "finished") continue;
    const seen = byChallenge.get(run.challenge.id);
    if (!seen || run.started_at > seen.started_at) byChallenge.set(run.challenge.id, run);
  }
  return byChallenge;
}

// "Your Run · 35 of 39 Cleared", or "Your Run · Finished".
export function yourRunLine(run: ChallengeRun): string {
  if (run.status === "finished") return "Your Run · Finished";
  return `Your Run · ${run.progress.cleared} of ${run.progress.target} Cleared`;
}

export interface SlotSquares {
  // One square per year, filled for a year the viewer's Run has Cleared.
  filled: boolean[];
  // Years past the first twenty ("+19").
  more: number;
}

const MAX_SQUARES = 20;

// A Slots flyer's picture: the viewer's Run when they have one, else the
// range's years outlined (twenty when the range starts at each member's
// birth year, which only a Run knows).
export function slotSquares(
  challenge: Pick<Challenge, "slots">,
  run: ChallengeRun | undefined,
  today: string,
): SlotSquares {
  const years = run?.slots?.years;
  if (years && years.length > 0) {
    const filled = years.map((y) => y.game_id != null);
    return {
      filled: filled.slice(0, MAX_SQUARES),
      more: Math.max(filled.length - MAX_SQUARES, 0),
    };
  }
  const slots = challenge.slots;
  const last = slots?.last_year === "current_year" ? Number(today.slice(0, 4)) : slots?.last_year;
  const count =
    typeof slots?.first_year === "number" && typeof last === "number" ? last - slots.first_year + 1 : MAX_SQUARES;
  return {
    filled: Array(Math.min(Math.max(count, 0), MAX_SQUARES)).fill(false),
    more: Math.max(count - MAX_SQUARES, 0),
  };
}
