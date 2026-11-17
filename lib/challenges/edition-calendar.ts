import { daysBetween, formatDay, type IsoDay } from "@/lib/challenges/dates";

// An Assignment (Secret Santa) Challenge's calendar (surface briefs
// challenges-assignment and challenges-form): its sign-up cutoff, pick
// deadline and reveal as MM-DD, an Edition's dates in a given year (as the
// API fixes them), the December strip of day tiles, and the rules told as a
// paragraph. Client-safe and pure: callers pass today.

export interface EditionCalendar {
  cutoff: string;
  deadline: string;
  reveal: string;
}

export interface EditionDates {
  signup_cutoff_on: IsoDay;
  pick_deadline_on: IsoDay;
  reveal_on: IsoDay;
}

export const SECRET_SANTA_CALENDAR: EditionCalendar = { cutoff: "12-01", deadline: "12-15", reveal: "12-25" };

// The backlog a member needs to sign up and again at the draw (the API's
// Editions::BACKLOG_MINIMUM).
export const BACKLOG_MINIMUM = 5;

export type KeyDay = "Draw" | "Picks due" | "Reveal";

export type StripTile =
  | { kind: "day"; date: IsoDay; day: number; key: KeyDay | null; past: boolean; today: boolean }
  // Days folded away on a long calendar (more than a month from draw to reveal).
  | { kind: "gap"; days: number; date: IsoDay };

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_DAY = /^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const MAX_TILES = 35;

function toUtc(day: IsoDay): Date {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function addDays(day: IsoDay, n: number): IsoDay {
  const date = toUtc(day);
  date.setUTCDate(date.getUTCDate() + n);
  return date.toISOString().slice(0, 10);
}

// "Tue 1 Dec", with the year when it isn't today's ("Sat 25 Dec 2027").
export function formatWeekday(day: IsoDay, today?: IsoDay): string {
  return `${WEEKDAYS[toUtc(day).getUTCDay()]} ${formatDay(day, today)}`;
}

// "1 December" from an MM-DD.
export function longMonthDay(monthDay: string): string {
  const [m, d] = monthDay.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]}`;
}

// The Edition whose reveal falls in `revealYear`: the pick deadline is the
// last such day before the reveal, the cutoff the last such day before that
// (so a calendar may cross the new year).
export function editionDatesIn(calendar: EditionCalendar, revealYear: number): EditionDates {
  const reveal = `${revealYear}-${calendar.reveal}`;
  const before = (monthDay: string, after: IsoDay) => {
    const year = Number(after.slice(0, 4));
    return monthDay < after.slice(5) ? `${year}-${monthDay}` : `${year - 1}-${monthDay}`;
  };
  const deadline = before(calendar.deadline, reveal);
  return { signup_cutoff_on: before(calendar.cutoff, deadline), pick_deadline_on: deadline, reveal_on: reveal };
}

function keyOf(dates: EditionDates, day: IsoDay): KeyDay | null {
  if (day === dates.signup_cutoff_on) return "Draw";
  if (day === dates.pick_deadline_on) return "Picks due";
  if (day === dates.reveal_on) return "Reveal";
  return null;
}

// Day tiles from `from` to `to`, the key days captioned. While today is on
// the strip, the days gone are marked and today is ringed. A strip longer
// than about a month keeps the key days and today (each with a day either
// side) and folds the rest into gaps.
function strip(dates: EditionDates, from: IsoDay, to: IsoDay, today: IsoDay | null): StripTile[] {
  const length = daysBetween(from, to) + 1;
  const running = today !== null && today >= from && today <= to;
  const anchors = [dates.signup_cutoff_on, dates.pick_deadline_on, dates.reveal_on, ...(running ? [today] : [])];
  const kept = (day: IsoDay) => length <= MAX_TILES || anchors.some((a) => Math.abs(daysBetween(a, day)) <= 1);
  const tiles: StripTile[] = [];
  for (let i = 0; i < length; i++) {
    const date = addDays(from, i);
    if (!kept(date)) {
      const last = tiles.at(-1);
      if (last?.kind === "gap") last.days += 1;
      else tiles.push({ kind: "gap", days: 1, date });
      continue;
    }
    tiles.push({
      kind: "day",
      date,
      day: Number(date.slice(8)),
      key: keyOf(dates, date),
      past: running && date < (today as IsoDay),
      today: running && date === today,
    });
  }
  return tiles;
}

// An Edition's strip: from the draw to the reveal.
export function calendarStrip(edition: EditionDates, today: IsoDay): StripTile[] {
  return strip(edition, edition.signup_cutoff_on, edition.reveal_on, today);
}

// The form's preview of a calendar: the whole of December when the three
// days sit in it, else the draw to the reveal.
export function calendarPreview(
  calendar: EditionCalendar,
  year: number,
): { title: string; tiles: StripTile[] } {
  const dates = editionDatesIn(calendar, year);
  const december = [calendar.cutoff, calendar.deadline, calendar.reveal].every((d) => d.startsWith("12-"));
  if (december && dates.signup_cutoff_on.startsWith(String(year))) {
    return { title: "December preview", tiles: strip(dates, `${year}-12-01`, `${year}-12-31`, null) };
  }
  return { title: "Calendar preview", tiles: strip(dates, dates.signup_cutoff_on, dates.reveal_on, null) };
}

// Day of a common year (1-365), so the order through the year can be read.
function dayOfYear(monthDay: string): number {
  return daysBetween("2025-01-01", `2025-${monthDay}`) + 1;
}

// What's wrong with a calendar, or null. The three days must be real,
// different, and come cutoff, deadline, reveal through the year (crossing
// the new year is fine); 29 February doesn't come every year.
export function calendarError(calendar: EditionCalendar): string | null {
  const days = [calendar.cutoff, calendar.deadline, calendar.reveal];
  if (!days.every((d) => MONTH_DAY.test(d))) return "Pick the three days.";
  if (days.includes("02-29")) return "29 February doesn't come every year: pick another day.";
  if (new Set(days).size < 3) return "Pick three different days.";
  const [a, b, c] = days.map(dayOfYear);
  if (((b - a + 365) % 365) + ((c - b + 365) % 365) >= 365) {
    return "The pick deadline comes after the sign-up cutoff, and the reveal after both.";
  }
  return null;
}

// The Edition told in one paragraph, from its calendar.
export function editionRules(calendar: EditionCalendar): string {
  const cutoff = longMonthDay(calendar.cutoff);
  const reveal = longMonthDay(calendar.reveal);
  return [
    `Sign up before ${cutoff} with at least ${BACKLOG_MINIMUM} games in your backlog.`,
    `On ${cutoff} everyone is drawn into one circle: you pick a game for one member, and another member picks one for you.`,
    `Picks are due ${longMonthDay(calendar.deadline)}, and a missed pick becomes a random game from the backlog.`,
    `Every game is revealed on ${reveal}, and you have until the next ${reveal} to Clear it.`,
    "Santas stay secret until the Edition ends.",
  ].join(" ");
}
