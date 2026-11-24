import type {
  AchievementFeedCard,
  AchievementFeedGroup,
  AchievementHighlightKind,
  AchievementUnlock,
} from "@/lib/api/types";
import { isUnknownUnlockDate, memberName, type SetBadge } from "@/lib/achievements";

// Pure helpers behind the community hub at /achievements: which Unlock a
// card leads with, a day band's tally and the rail's week. No React.

// When a group card holds several Highlights, the stamp shows the biggest.
const HIGHLIGHT_RANK: Record<AchievementHighlightKind, number> = {
  platinum: 0,
  mastery: 1,
  completion: 2,
  rare: 3,
};

// The group's lead Highlight Unlock, or null when it holds none (the card
// then stays single size).
export function leadHighlight(
  card: AchievementFeedGroup,
): (AchievementUnlock & { highlight: AchievementHighlightKind }) | null {
  let best: (AchievementUnlock & { highlight: AchievementHighlightKind }) | null = null;
  for (const unlock of card.unlocks) {
    const kind = unlock.highlight;
    if (!kind) continue;
    if (!best || HIGHLIGHT_RANK[kind] < HIGHLIGHT_RANK[best.highlight]) {
      best = { ...unlock, highlight: kind };
    }
  }
  return best;
}

// Platinum, Mastery and Completion wear foil; an ultra-rare Unlock wears the
// Rarity ink instead.
export function foilKind(kind: AchievementHighlightKind | null): SetBadge | null {
  return kind && kind !== "rare" ? kind : null;
}

// A day band's tally: "9 Unlocks · Aria, Borin" on Latest, "3 Highlights ·
// Aria, Cass" on Highlights. Members in order of first appearance.
export function dayTally(cards: AchievementFeedCard[]): string {
  let unlocks = 0;
  let highlights = 0;
  const names: string[] = [];
  for (const card of cards) {
    if (card.kind === "group") unlocks += card.count;
    else highlights += 1;
    const name = memberName(card.user);
    if (!names.includes(name)) names.push(name);
  }
  const tally =
    highlights > 0 && unlocks === 0
      ? `${highlights} ${highlights === 1 ? "Highlight" : "Highlights"}`
      : `${unlocks} ${unlocks === 1 ? "Unlock" : "Unlocks"}`;
  const shown = names.slice(0, 3).join(", ");
  const rest = names.length > 3 ? ` +${names.length - 3}` : "";
  return `${tally} · ${shown}${rest}`;
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
