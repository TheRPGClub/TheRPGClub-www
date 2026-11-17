import { CLUB_TIME_ZONE } from "@/lib/public-reminders";
import type { Challenge } from "@/lib/challenges/types";

// Challenge dates as the club reads them: days are the club's (America/New_York,
// the API's Challenges::TIME_ZONE), written YYYY-MM-DD, and a Season repeats
// every year as MM-DD to MM-DD (its end may come before its start, crossing
// the new year). Client-safe and pure: callers pass today.

export type IsoDay = string;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Today in the club's time zone.
export function clubToday(now: Date = new Date()): IsoDay {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: CLUB_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

function toUtc(day: IsoDay): number {
  const [y, m, d] = day.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

// Whole days from `from` to `to` (negative when `to` is earlier).
export function daysBetween(from: IsoDay, to: IsoDay): number {
  return Math.round((toUtc(to) - toUtc(from)) / 86_400_000);
}

function isLeap(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

// An MM-DD in a given year. 29 February in a year without one becomes
// 1 March for a start and 28 February for an end, as the API reads it.
function dayIn(year: number, monthDay: string, edge: "start" | "end"): IsoDay {
  let md = monthDay;
  if (md === "02-29" && !isLeap(year)) md = edge === "start" ? "03-01" : "02-28";
  return `${year}-${md}`;
}

export interface SeasonWindow {
  starts: IsoDay;
  ends: IsoDay;
}

// The Season holding `today`, else the next one to open.
export function seasonAround(season: { start: string; end: string }, today: IsoDay): SeasonWindow {
  const year = Number(today.slice(0, 4));
  const crosses = season.end < season.start;
  for (const y of [year - 1, year, year + 1]) {
    const starts = dayIn(y, season.start, "start");
    const ends = dayIn(crosses ? y + 1 : y, season.end, "end");
    if (today <= ends) return { starts, ends };
  }
  return {
    starts: dayIn(year + 1, season.start, "start"),
    ends: dayIn(year + 1, season.end, "end"),
  };
}

// Days left to play, counting today, while a clock runs: inside a Season, or
// before an Always Open Challenge's end date. Null otherwise.
export function daysLeft(
  challenge: Pick<Challenge, "schedule" | "season" | "ends_on" | "open">,
  today: IsoDay,
): number | null {
  if (!challenge.open) return null;
  if (challenge.schedule === "seasonal" && challenge.season) {
    const window = seasonAround(challenge.season, today);
    return today >= window.starts ? daysBetween(today, window.ends) + 1 : null;
  }
  if (challenge.ends_on) return Math.max(daysBetween(today, challenge.ends_on) + 1, 0);
  return null;
}

// "22 Sep", with the year when it is not `today`'s ("21 Jun 2027").
export function formatDay(day: IsoDay, today?: IsoDay): string {
  const [y, m, d] = day.split("-").map(Number);
  const base = `${d} ${MONTHS[m - 1]}`;
  return today && today.slice(0, 4) !== day.slice(0, 4) ? `${base} ${y}` : base;
}

// "3 Mar 2027", always with the year.
export function formatFullDay(day: IsoDay): string {
  return `${formatDay(day)} ${day.slice(0, 4)}`;
}

// "22 Sep" from an MM-DD.
export function formatMonthDay(monthDay: string): string {
  const [m, d] = monthDay.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]}`;
}

// "22 Sep – 20 Dec" for a Season.
export function seasonRange(season: { start: string; end: string }): string {
  return `${formatMonthDay(season.start)} – ${formatMonthDay(season.end)}`;
}

// When a Challenge runs, in a label: "Always Open" or the Season's dates.
export function whenLabel(challenge: Pick<Challenge, "schedule" | "season">): string {
  if (challenge.schedule === "seasonal" && challenge.season) return `Season ${seasonRange(challenge.season)}`;
  return "Always Open";
}

// What a Closed Challenge's tape says: when its next Season opens, or when an
// Always Open one ended. Null for an Open Challenge.
export function closedNote(
  challenge: Pick<Challenge, "schedule" | "season" | "ends_on" | "open">,
  today: IsoDay,
): string | null {
  if (challenge.open) return null;
  if (challenge.schedule === "seasonal" && challenge.season) {
    return `Opens ${formatDay(seasonAround(challenge.season, today).starts, today)}`;
  }
  return challenge.ends_on ? `Ended ${formatDay(challenge.ends_on, today)}` : "Closed";
}

// A date-time from the API as the club's day.
export function clubDayOf(dateTime: string): IsoDay {
  return clubToday(new Date(dateTime));
}
