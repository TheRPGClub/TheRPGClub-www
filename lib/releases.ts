import type { DatePrecision } from "@/lib/api/types";

// Release dates as the game page (www#115) and the Release Calendar (www#114)
// both show them. Dates are plain calendar days read in UTC, the club's day
// (the API's "today" too), so a Release never shifts a day with the reader's
// time zone. Every Date Precision's wording lives in one table, FORMATS.

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
// "Jan", "Feb", ...
export const MONTHS = MONTH_NAMES.map((name) => name.slice(0, 3));
// Sunday first, as Date#getUTCDay counts them.
export const WEEKDAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
// "Sun", "Mon", ...
export const WEEKDAYS = WEEKDAY_NAMES.map((name) => name.slice(0, 3));

const DAY_MS = 86_400_000;

// A YYYY-MM-DD (or the start of a longer ISO string) as midnight UTC. Any
// year works, 1969 and 0099 included.
export function utcDay(date: string): Date {
  const [y, m, d] = date.slice(0, 10).split("-").map(Number);
  const day = new Date(0);
  day.setUTCFullYear(y, m - 1, d);
  return day;
}

// A UTC Date back to YYYY-MM-DD.
export function isoDay(day: Date): string {
  return day.toISOString().slice(0, 10);
}

// Today's UTC calendar day as YYYY-MM-DD.
export function utcToday(now: Date = new Date()): string {
  return isoDay(now);
}

// Whole days from `from` to `to` (negative when `to` is earlier).
export function daysBetween(from: string, to: string): number {
  return Math.round((utcDay(to).getTime() - utcDay(from).getTime()) / DAY_MS);
}

// 1 to 4 for a month 1 to 12.
function quarterOf(month: number): number {
  return Math.floor((month - 1) / 3) + 1;
}

interface DayParts {
  y: number;
  m: number;
  d: number;
}

const pad = (n: number, width = 2) => String(n).padStart(width, "0");

interface PrecisionFormat {
  // The date at this precision: "25 Sep 2025", "Dec 2026", "Q3 2027", "2027".
  label: (p: DayParts) => string | null;
  // The list's big date beside a group: "17", "Dec", "Q3", "2027", "TBA".
  short: (p: DayParts) => string;
  // A period's name, months in full: "November 2026", "Q3 2027", "2027".
  period: (p: DayParts) => string;
  // HTML's machine-readable date where it has one (a quarter has none).
  machine: (p: DayParts) => string | undefined;
  // What is still unknown: the dashed chip ("Day TBA"), none for a day.
  note: string | null;
  // What a list section at this precision adds after its count.
  span: (p: DayParts) => string | null;
  // How many months the period spans from its first day; 0 is the day
  // itself, null is never over (TBA).
  months: number | null;
}

const FORMATS: Record<DatePrecision, PrecisionFormat> = {
  day: {
    label: ({ y, m, d }) => `${d} ${MONTHS[m - 1]} ${y}`,
    short: ({ d }) => String(d),
    period: ({ y, m, d }) => `${d} ${MONTH_NAMES[m - 1]} ${y}`,
    machine: ({ y, m, d }) => `${pad(y, 4)}-${pad(m)}-${pad(d)}`,
    note: null,
    span: () => null,
    months: 0,
  },
  month: {
    label: ({ y, m }) => `${MONTHS[m - 1]} ${y}`,
    short: ({ m }) => MONTHS[m - 1],
    period: ({ y, m }) => `${MONTH_NAMES[m - 1]} ${y}`,
    machine: ({ y, m }) => `${pad(y, 4)}-${pad(m)}`,
    note: "Day TBA",
    span: () => null,
    months: 1,
  },
  quarter: {
    label: ({ y, m }) => `Q${quarterOf(m)} ${y}`,
    short: ({ m }) => `Q${quarterOf(m)}`,
    period: ({ y, m }) => `Q${quarterOf(m)} ${y}`,
    machine: () => undefined,
    note: "Month TBA",
    span: ({ m }) => {
      const first = (quarterOf(m) - 1) * 3;
      return `${MONTH_NAMES[first]} to ${MONTH_NAMES[first + 2]}`;
    },
    months: 3,
  },
  year: {
    label: ({ y }) => String(y),
    short: ({ y }) => String(y),
    period: ({ y }) => String(y),
    machine: ({ y }) => pad(y, 4),
    note: "Month TBA",
    span: () => "any month",
    months: 12,
  },
  tba: {
    label: () => null,
    short: () => "TBA",
    period: () => "TBA",
    machine: () => undefined,
    note: "No date yet",
    span: () => "no date announced",
    months: null,
  },
};

// The table row and the date's parts; a dated precision missing its date
// reads as TBA.
function format(date: string | null, precision: DatePrecision): [PrecisionFormat, DayParts] {
  if (!date || precision === "tba") return [FORMATS.tba, { y: 0, m: 1, d: 1 }];
  const day = utcDay(date);
  return [FORMATS[precision], { y: day.getUTCFullYear(), m: day.getUTCMonth() + 1, d: day.getUTCDate() }];
}

// The date at its Date Precision: "25 Sep 2025", "Dec 2026", "Q3 2027",
// "2027", or null for TBA (and for a dated precision missing its date). A
// vague date is never printed as a day.
export function releaseDateLabel(date: string | null, precision: DatePrecision): string | null {
  const [f, p] = format(date, precision);
  return f.label(p);
}

// The big date in the list's date column: "17", "Dec", "Q3", "2027", "TBA".
export function shortDateLabel(date: string | null, precision: DatePrecision): string {
  const [f, p] = format(date, precision);
  return f.short(p);
}

// A period's name: "17 November 2026", "November 2026", "Q3 2027", "2027".
export function periodTitle(date: string | null, precision: DatePrecision): string {
  const [f, p] = format(date, precision);
  return f.period(p);
}

// A machine-readable date for <time>: a day, a month ("2026-12") or a year.
export function machineDate(date: string | null, precision: DatePrecision): string | undefined {
  const [f, p] = format(date, precision);
  return f.machine(p);
}

// The chip beside a vague date saying what is still unknown, or null for an
// exact day. TBA reads "No date yet".
export function precisionNote(precision: DatePrecision): string | null {
  return FORMATS[precision].note;
}

// What a list section adds after its count: "July to September", "any
// month", "no date announced"; none for a month.
export function precisionSpan(date: string | null, precision: DatePrecision): string | null {
  const [f, p] = format(date, precision);
  return f.span(p);
}

// The last day of the date's period (the day itself for `day`), or null for
// TBA.
export function periodEnd(date: string | null, precision: DatePrecision): string | null {
  const [f] = format(date, precision);
  if (f.months === null || !date) return null;
  const end = utcDay(date);
  // Day 0 of the month after the period is its last day.
  if (f.months > 0) end.setUTCMonth(end.getUTCMonth() + f.months, 0);
  return isoDay(end);
}

// Out already: its whole period ended before today. A month still running
// ("Nov 2026" in November) is not past, and TBA never is.
export function isPast(date: string | null, precision: DatePrecision, today: string): boolean {
  const end = periodEnd(date, precision);
  return end !== null && end < today;
}

// The region chip's tone for a region code: the three region inks, the
// Worldwide stroke, or the plain stroke every other region shares.
export type RegionTone = "region-na" | "region-eu" | "region-jp" | "region-ww" | "region";

const REGION_TONES: Record<string, RegionTone> = {
  NA: "region-na",
  EU: "region-eu",
  JP: "region-jp",
  WW: "region-ww",
};

export function regionTone(code: string): RegionTone {
  return REGION_TONES[code.toUpperCase()] ?? "region";
}
