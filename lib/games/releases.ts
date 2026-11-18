import type { DatePrecision, Release } from "@/lib/api/types";

// A game's Releases as its page shows them (www#115): one row per platform,
// each listing its region and date pairs at their Date Precision. Dates are
// plain calendar days read in UTC, the club's day (the API's "today" too), so
// a Release never shifts a day with the reader's time zone.

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// How many months each vague Date Precision spans, from its first day.
const PERIOD_MONTHS: Record<Exclude<DatePrecision, "day" | "tba">, number> = {
  month: 1,
  quarter: 3,
  year: 12,
};

// A countdown ("In 2 days") marks a dated day this close, in days.
export const SOON_DAYS = 7;

function parts(date: string): { y: number; m: number; d: number } {
  const [y, m, d] = date.slice(0, 10).split("-").map(Number);
  return { y, m, d };
}

function dayNumber(date: string): number {
  const { y, m, d } = parts(date);
  return Date.UTC(y, m - 1, d) / 86_400_000;
}

// Today's UTC calendar day as YYYY-MM-DD.
export function utcToday(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

// The date at its Date Precision: "25 Sep 2025", "Dec 2026", "Q3 2027",
// "2027", or null for TBA (and for a dated precision missing its date). A
// vague date is never printed as a day.
export function releaseDateLabel(
  date: string | null,
  precision: DatePrecision,
): string | null {
  if (!date || precision === "tba") return null;
  const { y, m, d } = parts(date);
  switch (precision) {
    case "day":
      return `${d} ${MONTHS[m - 1]} ${y}`;
    case "month":
      return `${MONTHS[m - 1]} ${y}`;
    case "quarter":
      return `Q${Math.floor((m - 1) / 3) + 1} ${y}`;
    case "year":
      return String(y);
  }
}

// The chip beside a vague date saying what is still unknown, or null for an
// exact day. TBA reads "No date yet".
export function precisionNote(precision: DatePrecision): string | null {
  switch (precision) {
    case "day":
      return null;
    case "month":
      return "Day TBA";
    case "quarter":
    case "year":
      return "Month TBA";
    case "tba":
      return "No date yet";
  }
}

// The last day of the Release's period (the day itself for `day`), or null
// for TBA.
export function periodEnd(date: string | null, precision: DatePrecision): string | null {
  if (!date || precision === "tba") return null;
  if (precision === "day") return date.slice(0, 10);
  const { y, m } = parts(date);
  // Day 0 of the month after the period is its last day.
  const end = new Date(Date.UTC(y, m - 1 + PERIOD_MONTHS[precision], 0));
  return end.toISOString().slice(0, 10);
}

// Out already: its whole period ended before today. A month still running
// ("Nov 2026" in November) is not past, and TBA never is.
export function isPastRelease(release: Release, today: string): boolean {
  const end = periodEnd(release.release_date, release.date_precision);
  return end !== null && end < today;
}

// "Today", "Tomorrow" or "In N days" for an exact day within SOON_DAYS of
// today, else null.
export function countdown(release: Release, today: string): string | null {
  if (release.date_precision !== "day" || !release.release_date) return null;
  const days = dayNumber(release.release_date) - dayNumber(today);
  if (days < 0 || days > SOON_DAYS) return null;
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `In ${days} days`;
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

export interface PlatformReleases {
  platformId: number;
  platformName: string;
  releases: Release[];
}

// One row per platform, in the order the API placed their first Release, so
// platforms read from the earliest out to the TBA ones; each keeps its
// Releases in the API's order.
export function releasesByPlatform(releases: Release[]): PlatformReleases[] {
  const rows = new Map<number, PlatformReleases>();
  for (const release of releases) {
    let row = rows.get(release.platform_id);
    if (!row) {
      row = { platformId: release.platform_id, platformName: release.platform_name, releases: [] };
      rows.set(release.platform_id, row);
    }
    row.releases.push(release);
  }
  return [...rows.values()];
}

// "14 Releases · 6 platforms".
export function releasesCount(releases: number, platforms: number): string {
  return `${releases} ${releases === 1 ? "Release" : "Releases"} · ${platforms} ${
    platforms === 1 ? "platform" : "platforms"
  }`;
}
