import type { PublicWinner, VotingCategory } from "@/lib/api/types";

// What the Share Card (spec api#518) reads out of the public winners window.
// The card's image URL carries the latest decided round (`?round=42`), so a
// link-preview cache sees each new round as a new image, and an image for one
// round never changes.

export const SHARE_CARD_PATH = "/share-card";

// One winner on the card: a category that ended with no winner is left out.
export interface ShareCardWinner {
  kind: VotingCategory;
  title: string;
  coverUrl: string | null;
  // The game's key art: the GOTM's fills the card ("The Cover"); without
  // it the card stands the covers side by side instead.
  artUrl: string | null;
}

// The round the card shows, for its footer ("Round 144 · November 2026").
export interface ShareCardIssue {
  round: number;
  // The archive's free-text month ("November 2026").
  monthYear: string;
}

// The card the image route draws: a round's covers (cached for good) or the
// brand-only fallback (cached briefly, so a real one replaces it soon).
export type ShareCardPlan =
  | { kind: "round"; issue: ShareCardIssue; winners: ShareCardWinner[] }
  | { kind: "brand" };

// The highest round_number in the window; null without winners.
export function latestDecidedRound(winners: PublicWinner[]): number | null {
  return winners.reduce<number | null>(
    (max, w) => (max === null || w.round_number > max ? w.round_number : max),
    null,
  );
}

// The image URL the site metadata names: keyed by the latest decided round,
// or bare (the brand-only card) without one.
export function shareCardImagePath(winners: PublicWinner[]): string {
  const round = latestDecidedRound(winners);
  return round === null ? SHARE_CARD_PATH : `${SHARE_CARD_PATH}?round=${round}`;
}

// A `?round=` value: a positive whole number, or null.
export function parseRound(value: string | null | undefined): number | null {
  if (!value || !/^[1-9]\d{0,8}$/.test(value)) return null;
  return Number(value);
}

// A round's lead pick per category, GOTM first, the way the front page leads
// with them.
export function roundWinners(winners: PublicWinner[], round: number): ShareCardWinner[] {
  const kinds: VotingCategory[] = ["gotm", "nr_gotm"];
  return kinds.flatMap((kind) => {
    const lead = winners.find((w) => w.round_number === round && w.kind === kind);
    return lead
      ? [{ kind, title: lead.title, coverUrl: lead.cover_url, artUrl: lead.art_url }]
      : [];
  });
}

// What to draw for a request: the asked-for round when the read has it,
// else the brand-only card. A round missing from the read (the API down or
// asleep, a round not yet decided, a bad query) never gets a round's image:
// the fallback's short cache then lets the real one land later.
export function planShareCard(winners: PublicWinner[], roundParam: string | null): ShareCardPlan {
  const round = parseRound(roundParam);
  if (round === null) return { kind: "brand" };
  const picks = roundWinners(winners, round);
  const monthYear = winners.find((w) => w.round_number === round)?.month_year ?? "";
  return picks.length > 0
    ? { kind: "round", issue: { round, monthYear }, winners: picks }
    : { kind: "brand" };
}
