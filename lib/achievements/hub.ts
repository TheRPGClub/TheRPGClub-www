import type { AchievementFeedCard } from "@/lib/api/types";
import { isUnknownUnlockDate } from "@/lib/achievements";
import { dayHeading } from "@/lib/news";

// Pure helpers behind the community hub at /achievements: a day band's
// heading and a row's time. No React.

// A day band's heading, as the News page heads its days ("Today" over
// "Tue 24 Nov · 41 Unlocks"); unknown-date Unlocks close the feed under
// "Unknown date".
export function hubDayHeading(
  day: string | null,
  cards: AchievementFeedCard[],
  now: Date,
): { title: string; note: string } {
  const unlocks = cards.reduce((sum, card) => sum + (card.kind === "group" ? card.count : 1), 0);
  const tally = `${unlocks} ${unlocks === 1 ? "Unlock" : "Unlocks"}`;
  if (!day) return { title: "Unknown date", note: tally };
  const heading = dayHeading(day, null, now);
  return { title: heading.title, note: heading.note ? `${heading.note} · ${tally}` : tally };
}

const TIME = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "UTC",
});

// "21:48" (UTC, the feed's day boundary); null for an unknown date.
export function formatUtcTime(iso: string): string | null {
  if (isUnknownUnlockDate(iso)) return null;
  return TIME.format(new Date(iso));
}
