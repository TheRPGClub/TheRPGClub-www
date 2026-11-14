import type { PublicWinner, VotingCategory } from "@/lib/api/types";
import type { LandingMarqueeItem } from "@/components/issue/landing-marquee";

// What the front page reads out of the public winners window
// (GET /api/v1/public/winners): newest round first, and GOTM before NR-GOTM
// in `game_index` order within a round.

const SHELF_SIZE = 5;

// The cover: the first GOTM of the latest round, numbered by that round.
// Null when there are no winners or the latest round has no GOTM.
export function coverLead(
  winners: PublicWinner[],
): { lead: PublicWinner; roundNumber: number } | null {
  const latest = winners[0];
  if (!latest) return null;
  const lead = winners.find(
    (w) => w.round_number === latest.round_number && w.kind === "gotm",
  );
  return lead ? { lead, roundNumber: latest.round_number } : null;
}

// Each round's lead pick for one track, newest first.
export function trackShelf(
  winners: PublicWinner[],
  kind: VotingCategory,
): PublicWinner[] {
  const seen = new Set<number>();
  return winners
    .filter((w) => {
      if (w.kind !== kind || seen.has(w.round_number)) return false;
      seen.add(w.round_number);
      return true;
    })
    .slice(0, SHELF_SIZE);
}

// Every Game of the Month in the public window, newest first.
export function marqueeItems(winners: PublicWinner[]): LandingMarqueeItem[] {
  return winners
    .filter((w) => w.kind === "gotm")
    .map((w) => ({
      key: `${w.round_number}-${w.game_id}`,
      title: w.title,
      coverUrl: w.cover_url,
      roundNumber: w.round_number,
    }));
}
