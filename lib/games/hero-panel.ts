import type { User } from "@/lib/api/types";
import { CLUB_TIME_ZONE } from "@/lib/public-reminders";
import { reviewerName } from "@/lib/reviews/reviewer-name";

// The game page's hero panel: the small line under who's playing a game and
// who finished it, naming the latest member and when.

export interface LatestMember {
  name: string;
  when: string;
}

// The entry with the newest date, its member named and the date said in the
// club's time zone: "3 Nov" this year, "Oct 2025" (month and year) for a
// completion. Null when no entry has a readable date.
export function latestMember<T extends { user_id: string; user?: User | null }>(
  entries: readonly T[],
  dateOf: (entry: T) => string | null | undefined,
  style: "day" | "month",
  now: Date = new Date(),
): LatestMember | null {
  let best: { entry: T; at: Date } | null = null;
  for (const entry of entries) {
    const raw = dateOf(entry);
    const at = raw ? new Date(raw) : null;
    if (!at || Number.isNaN(at.getTime())) continue;
    if (!best || at > best.at) best = { entry, at };
  }
  if (!best) return null;
  const year = (d: Date) =>
    new Intl.DateTimeFormat("en-GB", { timeZone: CLUB_TIME_ZONE, year: "numeric" }).format(d);
  const when = new Intl.DateTimeFormat("en-GB", {
    timeZone: CLUB_TIME_ZONE,
    day: style === "day" ? "numeric" : undefined,
    month: "short",
    year: style === "month" || year(best.at) !== year(now) ? "numeric" : undefined,
  }).format(best.at);
  return { name: reviewerName(best.entry.user, "A member"), when };
}
