import type { User } from "@/lib/api/types";
import { clubToday, dayOf, type IsoDay } from "@/lib/shelf-forms/dates";
import { reviewerName } from "@/lib/reviews/reviewer-name";

// The game page's hero panel: the small line under who's playing a game and
// who finished it, naming the latest member and when.

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export interface LatestMember {
  name: string;
  when: string;
}

// The entry with the newest date, its member named and its day said by the
// club-day rule (`dayOf`, the one the shelf forms use): "3 Nov" this year,
// "Oct 2025" (month and year) for a completion. Null when no entry has a
// readable date.
export function latestMember<T extends { user_id: string; user?: User | null }>(
  entries: readonly T[],
  dateOf: (entry: T) => string | null | undefined,
  style: "day" | "month",
  now: Date = new Date(),
): LatestMember | null {
  let best: { entry: T; at: number; day: IsoDay } | null = null;
  for (const entry of entries) {
    const raw = dateOf(entry);
    const day = dayOf(raw);
    if (!raw || !day) continue;
    const at = Date.parse(raw);
    if (!best || at > best.at) best = { entry, at, day };
  }
  if (!best) return null;
  const [y, m, d] = best.day.split("-").map(Number);
  const month = MONTHS[m - 1];
  const thisYear = clubToday(now).slice(0, 4) === String(y);
  const when = style === "month" ? `${month} ${y}` : thisYear ? `${d} ${month}` : `${d} ${month} ${y}`;
  return { name: reviewerName(best.entry.user, "A member"), when };
}
