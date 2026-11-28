"use client";

import { useMemo } from "react";
import type {
  Nomination,
  NominationVote,
  VoteTallyRow,
  VotingCategory,
} from "@/lib/api/types";
import { useBoardVotes } from "@/hooks/use-board-votes";
import { cn } from "@/lib/utils";
import { CountsHiddenNote } from "./counts-hidden-note";
import { NominationCard } from "./nomination-card";
import { VoteError } from "./vote-error";

export interface NominationBoardProps {
  category: VotingCategory;
  round: number;
  nominations: Nomination[];
  tally: VoteTallyRow[];
  // Per-user vote cap for the round (2, or 3 for fields of 9+ nominations).
  cap: number;
  // The signed-in member's own votes for the round.
  userVotes: NominationVote[];
  votingOpen: boolean;
  votingEnded: boolean;
  // The API withholds the counts from this viewer while voting is open
  // (only Admins see them then): show that instead of a board of zeros.
  countsHidden?: boolean;
  emptyMessage?: string;
  // The signed-in member, so their own nomination can be marked. The board
  // otherwise only knows about votes, not who nominated what.
  viewerId?: string;
}

export function NominationBoard({
  category,
  round,
  nominations,
  tally,
  cap,
  userVotes,
  votingOpen,
  votingEnded,
  countsHidden = false,
  emptyMessage = "No nominations yet.",
  viewerId,
}: NominationBoardProps) {
  const votes = useBoardVotes({ category, round, tally, userVotes, cap });
  const { counts, maxCount } = votes;
  const showCounts = (votingOpen || votingEnded) && !countsHidden;

  // Once the vote has ended the board reads as the result, most votes first.
  const ordered = useMemo(() => {
    if (!votingEnded) return nominations;
    return [...nominations].sort(
      (a, b) => (counts.get(b.nomination_id) ?? 0) - (counts.get(a.nomination_id) ?? 0),
    );
  }, [nominations, votingEnded, counts]);

  if (!nominations.length) {
    return (
      <p data-slot="issue-note" className="rounded-md border border-dashed border-border-strong px-4 py-12 text-center text-dim-foreground">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {votingOpen && (
        <p className="font-label text-[0.9rem] font-bold tracking-[0.04em] text-dim-foreground">
          You&apos;ve used{" "}
          <span
            className={cn(
              "font-extrabold",
              category === "gotm" ? "text-gotm-soft" : "text-nr-soft",
            )}
          >
            {votes.votesUsed} of {cap}
          </span>{" "}
          votes. Vote again on a game to take that vote back.
        </p>
      )}

      {countsHidden && <CountsHiddenNote />}

      {votes.error && (
        <VoteError
          role="alert"
          message={votes.error}
          onDismiss={votes.clearError}
          className="border-destructive/50"
        />
      )}

      <ul className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 xl:gap-x-4.5">
        {ordered.map((nomination) => {
          const count = counts.get(nomination.nomination_id) ?? 0;
          const gameId = nomination.gamedb_game_id;
          return (
            <NominationCard
              key={nomination.nomination_id}
              category={category}
              nomination={nomination}
              count={showCounts ? count : null}
              maxCount={maxCount}
              voted={gameId !== null && votes.votedGameIds.has(gameId)}
              isWinner={votingEnded && maxCount > 0 && count === maxCount}
              isOwn={viewerId !== undefined && nomination.user_id === viewerId}
              votingOpen={votingOpen}
              disabled={votes.pendingId === nomination.nomination_id}
              onVote={() => votes.vote(nomination)}
            />
          );
        })}
      </ul>
    </div>
  );
}
