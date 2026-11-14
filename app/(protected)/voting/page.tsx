import { Suspense } from "react";
import { fetchVotingRound } from "@/lib/api/voting-round";
import { getSession, requireFeature } from "@/lib/session";
import { loadRound } from "@/lib/voting/load-round";
import { PreviewBadge } from "@/components/feature/preview-badge";
import { NoRound } from "@/components/voting/no-round";
import { VotingRound } from "@/components/voting/voting-round";
import { VotingSkeleton } from "@/components/voting/voting-skeleton";

// The current voting round: its nominations, its ballot and its result.
export default function VotingPage() {
  return (
    <Suspense fallback={<VotingSkeleton />}>
      <VotingContent />
    </Suspense>
  );
}

async function VotingContent() {
  const [features, round, session] = await Promise.all([
    requireFeature("voting_gotm"),
    fetchVotingRound(),
    getSession(),
  ]);
  const badge = features.preview("voting_gotm") && <PreviewBadge />;
  if (!round) return <NoRound badge={badge} />;

  const viewerId = session?.principal.id;
  const { tracks, now } = await loadRound(round, viewerId);
  return <VotingRound round={round} tracks={tracks} now={now} viewerId={viewerId} badge={badge} />;
}
