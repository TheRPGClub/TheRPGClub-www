"use client";

import { Crown } from "lucide-react";
import type { VotingCategory } from "@/lib/api/types";
import { useBallotVote } from "@/hooks/use-ballot-vote";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { BAR_MOTION, type VotingAccent } from "./accents";
import { BallotFooter } from "./ballot-footer";
import { BallotStanding } from "./ballot-standing";
import { VoteError } from "./vote-error";

export interface GameBallotPanelProps {
  category: VotingCategory;
  categoryTitle: string;
  accent: VotingAccent;
  round: number;
  // The nomination the vote targets: the one the viewer already voted on when
  // there is one, otherwise the game's earliest nomination. The backend
  // toggles by game rather than by nomination, so any of them takes the vote
  // back — but reusing the voted-on one keeps the round-trip a plain toggle.
  nominationId: number;
  // Totals across every nomination of this game, and of the leading game —
  // two members can nominate the same game and the tally counts each
  // nomination separately.
  count: number;
  maxCount: number;
  // The API withholds the counts from this viewer while voting is open
  // (only Admins see them then); `count` and `maxCount` are 0 and mean
  // nothing, so say the counts are hidden instead.
  countsHidden: boolean;
  voted: boolean;
  // How many of the viewer's votes are already spent, out of the round's cap.
  votesUsed: number;
  cap: number;
  votingOpen: boolean;
  isWinner: boolean;
  nominatedBy: string[];
  // False for signed-out visitors, who still see the ballot standing.
  signedIn: boolean;
}

// Shown on a game's page while the game is sitting on the current round's
// ballot, so a member who arrived here from a link or a search can vote
// without going to /voting to find the card again.
export function GameBallotPanel(props: GameBallotPanelProps) {
  const { category, categoryTitle, round, maxCount, countsHidden, cap } = props;
  const { votingOpen, isWinner, nominatedBy, signedIn } = props;
  const ballot = useBallotVote(props);

  // A vote landing here changes the leader too, so the bar tracks whichever is
  // larger rather than clipping at a stale maximum.
  const scale = Math.max(maxCount, ballot.count);
  const gotm = category === "gotm";

  return (
    <section
      aria-label={`${categoryTitle} ballot, round ${round}`}
      className="relative overflow-hidden rounded-md border border-border bg-card px-4 pt-4 pb-3.5 sm:px-5"
    >
      <span aria-hidden className={cn("absolute inset-x-0 top-0 h-1", gotm ? "bg-gotm" : "bg-nr")} />
      <div className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-3 sm:grid-cols-[auto_1fr_auto] sm:gap-x-5.5">
        <p
          aria-hidden
          className={cn(
            "font-headline text-[2.6rem] leading-[0.85] sm:text-[3.4rem]",
            gotm ? "text-gotm" : "text-nr-soft",
          )}
        >
          {round}
        </p>
        <div className="min-w-0">
          <h2 className="font-label text-[1.05rem] leading-tight font-extrabold tracking-[0.04em] sm:text-lg">
            Round {round} · {categoryTitle}
            {isWinner && (
              <span className="font-label ml-2.5 inline-flex translate-y-[-2px] items-center gap-1.5 rounded-xs bg-foreground px-1.5 py-px align-middle text-[0.78rem] font-extrabold tracking-[0.08em] text-background [&_svg]:size-3.5">
                <Crown aria-hidden />
                Won the round
              </span>
            )}
          </h2>
          <p className="mt-0.5 text-[0.85rem] text-dim-foreground">
            {votingOpen ? "On the ballot" : "Was on the ballot"}
            {nominatedBy.length > 0 && <> · nominated by {formatList(nominatedBy)}</>}
          </p>
        </div>
        <BallotStanding
          count={ballot.count}
          countsHidden={countsHidden}
          voted={ballot.voted}
          pending={ballot.pending}
          canVote={votingOpen && signedIn}
          onVote={ballot.vote}
        />
      </div>

      {!countsHidden && scale > 0 && (
        // Relative to the leading game's tally, matching the board's bars.
        <Progress
          value={ballot.count}
          max={scale}
          aria-label={`${ballot.count} of ${scale} votes`}
          className="mt-3.5"
          tone={gotm ? "gotm" : "nr"}
          indicatorClassName={BAR_MOTION}
        />
      )}

      {ballot.error && (
        <VoteError
          message={ballot.error}
          onDismiss={ballot.clearError}
          className="mt-3 border-destructive/40"
        />
      )}

      <BallotFooter votingOpen={votingOpen} signedIn={signedIn} used={ballot.used} cap={cap} />
    </section>
  );
}

function formatList(names: string[]): string {
  if (names.length === 1) return names[0];
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}
