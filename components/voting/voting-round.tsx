import type { ReactNode } from "react";
import type { VotingCategory, VotingRound as Round } from "@/lib/api/types";
import { ballotIsPublic } from "@/lib/api/voting-round";
import type { TrackData } from "@/lib/voting/load-round";
import { phaseCopy } from "@/lib/voting/phase";
import { VotingStrip } from "@/components/issue/voting-strip";
import { PageHeader } from "@/components/templates/page-header";
import { NominationBoard } from "./nomination-board";
import { stripSlots } from "./strip-slots";
import { VotingTabs } from "./voting-tabs";

// One round at a time, as the backend reports it on voting_rounds/current:
// members nominate for it, then vote on those same nominations, then it is
// decided and the backend schedules the next. The backend owns which round
// that is and enforces every window; this page never derives a round number.
//
// The page is the ballot: a yellow strip with the live window's clock and the
// viewer's own business per track, over a tabbed board of every nomination as
// a cover tile. Before the vote opens the board lists the nominations without
// counts; from then on it is the ballot and its tally.

const TAB_LABEL: Record<VotingCategory, string> = {
  gotm: "Game of the Month",
  nr_gotm: "Non-RPG",
};

export function VotingRound({
  round,
  tracks,
  now,
  viewerId,
  badge,
}: {
  round: Round;
  tracks: TrackData[];
  now: number;
  viewerId: string | undefined;
  badge: ReactNode;
}) {
  const phase = phaseCopy(round, now);
  const ballot = ballotIsPublic(round);

  return (
    <div className="space-y-7">
      <PageHeader
        title={phase.title}
        badge={badge}
        count={`Round ${round.round_number} · ${round.month_year}`}
      />

      <VotingStrip
        label={`Round ${round.round_number} ${phase.title.toLowerCase()}`}
        clock={phase.clock}
        slots={stripSlots(round, tracks, viewerId)}
      />

      <VotingTabs
        tabs={tracks.map((track) => ({
          category: track.category,
          label: TAB_LABEL[track.category],
          count: track.nominations.length,
          panel: (
            <NominationBoard
              category={track.category}
              round={round.round_number}
              nominations={track.nominations}
              tally={track.tally.rows}
              cap={track.tally.cap}
              userVotes={track.userVotes}
              votingOpen={round.voting_open}
              votingEnded={round.voting_ended}
              countsHidden={track.tally.countsHidden}
              viewerId={viewerId}
              emptyMessage={
                ballot ? "No games on this round's ballot." : "No nominations yet. Be the first!"
              }
            />
          ),
        }))}
      />
    </div>
  );
}
