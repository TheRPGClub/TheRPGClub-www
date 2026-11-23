import type { Release } from "@/lib/api/types";
import { daysBetween, isPast } from "@/lib/releases";

// A game's Releases as its page shows them (www#115): one row per platform,
// each listing its region and date pairs at their Date Precision. The date
// wording it shares with the Release Calendar lives in `lib/releases.ts`.

// A countdown ("In 2 days") marks a dated day this close, in days.
export const SOON_DAYS = 7;

// "Today", "Tomorrow" or "In N days" for an exact day within SOON_DAYS of
// today, else null.
export function countdown(release: Release, today: string): string | null {
  if (release.date_precision !== "day" || !release.release_date) return null;
  const days = daysBetween(today, release.release_date);
  if (days < 0 || days > SOON_DAYS) return null;
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `In ${days} days`;
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

// The game's next Release: the first in the API's placement order (earliest
// first, TBA last) that has a date and isn't past. A TBA one is never next.
export function nextRelease(releases: Release[], today: string): Release | null {
  return releases.find((r) => r.release_date && !isPast(r.release_date, r.date_precision, today)) ?? null;
}
