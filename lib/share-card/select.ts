import type { PublicWinner, VotingCategory } from "@/lib/api/types";

// What the Share Card (spec api#518) reads out of the public winners window.
// The card's image URL carries the latest decided round and a short hash of
// everything the card draws for it (`?round=42&v=1x9k2a`): a round decided
// in steps, a cover added later or the round no longer being the latest each
// make a new URL, so an image cached for good under one URL never goes stale.

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
  // Whether it is the latest decided round: only that one is "this month".
  latest: boolean;
}

// The card the image route draws: a round's covers (cached for good when the
// URL's `v` matches `version`) or the brand-only fallback (cached briefly, so
// a real one replaces it soon).
export type ShareCardPlan =
  | { kind: "round"; issue: ShareCardIssue; winners: ShareCardWinner[]; version: string }
  | { kind: "brand" };

// The highest round_number in the window; null without winners.
export function latestDecidedRound(winners: PublicWinner[]): number | null {
  return winners.reduce<number | null>(
    (max, w) => (max === null || w.round_number > max ? w.round_number : max),
    null,
  );
}

// A short hash (32-bit FNV-1a, base 36) of what a round's card draws: the
// issue line, whether it is the latest round, and each winner's title, cover
// and key art.
export function shareCardVersion(issue: ShareCardIssue, winners: ShareCardWinner[]): string {
  const drawn = JSON.stringify([
    issue.round, issue.monthYear, issue.latest,
    winners.map((w) => [w.kind, w.title, w.coverUrl, w.artUrl]),
  ]);
  let hash = 0x811c9dc5;
  for (let i = 0; i < drawn.length; i++) {
    hash ^= drawn.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36);
}

// The image URL the site metadata names: keyed by the latest decided round
// and what its card draws, or bare (the brand-only card) without one.
export function shareCardImagePath(winners: PublicWinner[]): string {
  const round = latestDecidedRound(winners);
  const plan = planShareCard(winners, round === null ? null : String(round));
  return plan.kind === "round"
    ? `${SHARE_CARD_PATH}?round=${plan.issue.round}&v=${plan.version}`
    : SHARE_CARD_PATH;
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
  if (picks.length === 0) return { kind: "brand" };
  const monthYear = winners.find((w) => w.round_number === round)?.month_year ?? "";
  const issue = { round, monthYear, latest: round === latestDecidedRound(winners) };
  return { kind: "round", issue, winners: picks, version: shareCardVersion(issue, picks) };
}
