import { clubToday, daysBetween, type IsoDay } from "@/lib/challenges/dates";

export { clubToday, daysBetween, type IsoDay };

// The days the list forms pick (spec api#451): whole days, YYYY-MM-DD, read
// and written as the API stores them. Client-safe and pure: callers pass
// today (the club's, `clubToday()`).

const ISO_DAY = /^(\d{4})-(\d{2})-(\d{2})$/;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function isIsoDay(value: unknown): value is IsoDay {
  if (typeof value !== "string") return false;
  const match = ISO_DAY.exec(value);
  if (!match) return false;
  const [y, m, d] = match.slice(1).map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

// The day a stored timestamp falls on, as the API reads it (its UTC date):
// a completion's `completed_at`, a Now Playing entry's `added_at`. A plain
// day (`started_at`) comes back as it is. Null when blank or unreadable.
export function dayOf(value: string | null | undefined): IsoDay | null {
  if (!value) return null;
  if (isIsoDay(value)) return value;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

// A day as the calendar holds it (local midnight, so the grid shows that
// day whatever the viewer's zone), and back.
export function dateOfDay(day: IsoDay): Date {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function dayOfDate(date: Date): IsoDay {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function parts(day: IsoDay) {
  const [y, m, d] = day.split("-").map(Number);
  return { y, m, d, weekday: WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()] };
}

// "Tue 24 Nov 2026".
export function longDay(day: IsoDay): string {
  const { y, m, d, weekday } = parts(day);
  return `${weekday} ${d} ${MONTHS[m - 1]} ${y}`;
}

// "9 Nov".
export function shortDay(day: IsoDay): string {
  const { m, d } = parts(day);
  return `${d} ${MONTHS[m - 1]}`;
}

// A big date block's two lines: "09" over "Nov 2026".
export function dayBlock(day: IsoDay): { day: string; monthYear: string } {
  const { y, m, d } = parts(day);
  return { day: String(d).padStart(2, "0"), monthYear: `${MONTHS[m - 1]} ${y}` };
}

// "15 days" between Started and Finished; null until both are set or when
// they are the wrong way round.
export function spanText(started: IsoDay | null, finished: IsoDay | null): string | null {
  if (!started || !finished) return null;
  const days = daysBetween(started, finished);
  if (days < 0) return null;
  if (days === 0) return "Same day";
  return days === 1 ? "1 day" : `${days} days`;
}

export interface DateProblems {
  started?: string;
  finished?: string;
}

export const DATE_MESSAGES = {
  startedAfterFinished: "Started can't be after Finished.",
  finishedInFuture: "Finished can't be in the future.",
  startedInFuture: "Started can't be in the future.",
} as const;

// A Game Completion's two days (spec api#451): Started is optional and on
// or before Finished, and Finished is not after today, the club's day. The
// API refuses the same (422 `started_after_finished`, `finished_in_future`).
export function completionDateProblems(
  started: IsoDay | null,
  finished: IsoDay | null,
  today: IsoDay,
): DateProblems {
  const problems: DateProblems = {};
  if (finished && finished > today) problems.finished = DATE_MESSAGES.finishedInFuture;
  if (started && finished && started > finished) problems.started = DATE_MESSAGES.startedAfterFinished;
  else if (started && !finished && started > today) problems.started = DATE_MESSAGES.startedInFuture;
  return problems;
}

// A Now Playing entry's Started day (its `added_at`): not after today (422
// `added_in_future`).
export function nowPlayingDateProblems(started: IsoDay | null, today: IsoDay): DateProblems {
  return started && started > today ? { started: DATE_MESSAGES.startedInFuture } : {};
}
