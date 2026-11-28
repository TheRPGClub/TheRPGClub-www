import type { DashboardIssue } from "@/lib/dashboard/issue";
import { CoverStory } from "@/components/issue/cover-story";
import { NrFeature } from "@/components/issue/nr-feature";
import { PreviousRounds } from "@/components/issue/previous-rounds";
import { RoundPanel } from "@/components/issue/round-panel";
import { NoRound } from "@/components/dashboard/dashboard-notes";
import { cn } from "@/lib/utils";

// The current issue (lib/dashboard/issue). A round missing one track gives
// its column away: with no NR-GOTM the nominations panel takes the whole
// right column; with no GOTM the NR-GOTM is promoted to the cover. The
// member's Dashboard Panels follow it (components/dashboard/panels).
export function DashboardIssueView({
  issue,
  viewerId,
}: {
  issue: DashboardIssue;
  viewerId: string;
}) {
  const { round, voting, gotm, nrGotm, counts, previous } = issue;

  const panel = voting && (
    <RoundPanel
      round={voting}
      nominations={issue.nominations}
      viewerId={viewerId}
      now={issue.now}
      tall={!(gotm && nrGotm)}
    />
  );

  if (!round || (!gotm && !nrGotm)) {
    return (
      <div className="space-y-10">
        <div className="grid gap-5 lg:grid-cols-[1fr_23rem]">
          <NoRound />
          {panel}
        </div>
        <PreviousRounds rounds={previous} />
      </div>
    );
  }

  const lead = (gotm ?? nrGotm)!;
  const cover = (
    <CoverStory
      kind={gotm ? "gotm" : "nr_gotm"}
      roundNumber={round.round_number}
      monthYear={lead.month_year}
      games={lead.games}
      votingResultsMessageId={lead.voting_results_message_id}
      absentNote={gotm ? undefined : "No Game of the Month this round"}
      counts={counts}
    />
  );
  const rail =
    gotm && nrGotm ? (
      <div className="grid gap-5 lg:grid-rows-[1fr_auto]">
        <NrFeature
          roundNumber={round.round_number}
          games={nrGotm.games}
          votingResultsMessageId={nrGotm.voting_results_message_id}
          counts={counts}
        />
        {panel}
      </div>
    ) : (
      panel
    );

  return (
    <div data-slot="dashboard-issue" className="space-y-10">
      <div data-slot="issue-spread" className={cn("grid gap-5", rail && "lg:grid-cols-[1fr_23rem]")}>
        {cover}
        {rail}
      </div>
      <PreviousRounds rounds={previous} />
    </div>
  );
}
