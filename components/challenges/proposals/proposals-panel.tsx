import type { ChallengePage } from "@/lib/challenges/challenge-page";
import { fetchPoolProposals } from "@/lib/api/challenges";
import { deciderLine, decidesProposals, proposalsBadge, proposalViews } from "@/lib/challenges/proposals";
import type { ChallengePoolProposal } from "@/lib/challenges/types";
import { DeciderInbox } from "@/components/challenges/proposals/decider-inbox";
import { MemberProposals } from "@/components/challenges/proposals/member-proposals";

// The Proposals view of a Pool Challenge (www#172, pick 9A): whoever
// decides gets the inbox (list notices, then proposals to Accept or
// Decline); every other member proposes games and sees their own waiting.
// `proposals` is null when they couldn't be read.
export function ProposalsPanel({
  page,
  proposals,
}: {
  page: ChallengePage;
  proposals: ChallengePoolProposal[] | null;
}) {
  const { challenge } = page;
  const views = proposals ? proposalViews(proposals, challenge) : null;
  if (!decidesProposals(challenge)) {
    return <MemberProposals challengeId={challenge.id} decider={deciderLine(challenge)} proposals={views} />;
  }
  const list = challenge.pool?.game_list;
  return (
    <DeciderInbox
      challenge={{
        id: challenge.id,
        name: challenge.name,
        list: list ? { name: list.name, canAdd: list.can_add } : null,
        activeRuns: page.runs?.filter((run) => run.status === "active").length ?? 0,
      }}
      notices={challenge.list_notices ?? []}
      proposals={views}
    />
  );
}

// The Proposals tab of a Pool Challenge's page: every member who can see
// the Challenge may propose (pick 9A), so it is offered to all; its pending
// proposals are read only when the view is open. Undefined for other
// Formats.
export async function proposalsTab(page: ChallengePage, open: boolean) {
  const { challenge } = page;
  if (challenge.challenge_format !== "pool" || !challenge.pool) return undefined;
  return {
    count: null,
    badge: proposalsBadge(challenge),
    panel: open ? <ProposalsPanel page={page} proposals={await fetchPoolProposals(challenge.id, "pending")} /> : null,
  };
}
