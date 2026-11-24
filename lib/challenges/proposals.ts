import { shelfAge } from "@/lib/giveaways";
import { memberAvatar, memberName } from "@/lib/challenges/runs";
import type { Challenge, ChallengePoolGame, ChallengePoolProposal } from "@/lib/challenges/types";

// The Proposals view of a Pool Challenge (www#172, pick 9A) as plain data.
// Server-side for the avatars (they need the API's address); the views it
// makes are client-safe.

export interface ProposalView {
  id: number;
  game: ChallengePoolGame;
  proposer: { name: string; avatar: string | null };
  note: string | null;
  // "today", "2 days ago"...
  when: string;
  // The Host left the game out of the Pool: accepting it puts it back.
  leftOut: boolean;
}

// Who decides on proposals reads the Challenge's `pending_proposals` (the
// API sends it to the Host and Moderators and above only, null otherwise),
// so the page never works out roles itself.
export function decidesProposals(challenge: Pick<Challenge, "pending_proposals">): boolean {
  return challenge.pending_proposals != null;
}

// The yellow badge on the Proposals tab, for whoever decides: proposals
// waiting plus list notices to settle. Null for nothing waiting.
export function proposalsBadge(challenge: Pick<Challenge, "pending_proposals" | "list_notices">): number | null {
  const waiting = (challenge.pending_proposals ?? 0) + (challenge.list_notices?.length ?? 0);
  return waiting > 0 ? waiting : null;
}

export function proposalViews(
  proposals: readonly ChallengePoolProposal[],
  challenge: Pick<Challenge, "pool">,
  now: Date = new Date(),
): ProposalView[] {
  const excluded = new Set((challenge.pool?.excluded_games ?? []).map((g) => g.game_id));
  return proposals
    .filter((p) => p.status === "pending" && p.game)
    .map((p) => ({
      id: p.id,
      game: p.game as ChallengePoolGame,
      proposer: p.proposer
        ? { name: memberName(p.proposer), avatar: memberAvatar(p.proposer) }
        : { name: "A member", avatar: null },
      note: p.note?.trim() || null,
      when: shelfAge(p.created_at, now),
      leftOut: excluded.has((p.game as ChallengePoolGame).game_id),
    }));
}

// Who decides, as the member's propose form says it.
export function deciderLine(challenge: Pick<Challenge, "hosted_by_club" | "host">): string {
  if (challenge.hosted_by_club || !challenge.host) return "The club's staff decide.";
  return `${memberName(challenge.host)}, the Host, decides.`;
}
