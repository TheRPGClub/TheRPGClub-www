"use client";

import { ArrowRight } from "lucide-react";
import type { NominatedGame } from "@/lib/goty/awards";
import { gameTitle, nominatedBy, votesFor } from "@/lib/goty/awards";
import type { GotyAward, GotyVote } from "@/lib/goty/types";
import { useGotyVotes, useReportVotes } from "@/hooks/use-goty-votes";
import { Button } from "@/components/ui/button";
import { NoticeSlip } from "@/components/issue/notice-slip";
import { VoteError } from "@/components/voting/vote-error";
import { BallotCard } from "./ballot-card";
import { CapTicks } from "./cap-ticks";

// An Award's ballot: the rule line with the viewer's votes as ticks
// against the cap, the dropped-vote slip, the candidates as big covers
// with their Vote buttons, and the step to the next Award. Read-only
// (with the counts) once voting has closed.
export function AwardBallot({
  vote,
  award,
  nominated,
  viewerId,
  open,
  onNext,
  nextName,
  onVotes,
}: {
  vote: GotyVote;
  award: GotyAward;
  nominated: NominatedGame[];
  viewerId: string | undefined;
  open: boolean;
  onNext: () => void;
  nextName: string;
  onVotes: (votes: number[]) => void;
}) {
  const votes = useGotyVotes({ year: vote.year, award: award.award, initial: award.own_votes, cap: award.cap });
  useReportVotes(votes.votes, onVotes);
  const goty = award.award === "game_of_the_year";
  const nominations = new Map(nominated.map((n) => [n.game.game_id, n]));
  const hidden = award.tally.counts_hidden;
  return (
    <section className="flex flex-col gap-5">
      <div className="mt-1 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-4">
        <p className="text-[0.95rem] text-dim-foreground">
          {open ? (
            <>
              Vote for up to <b className="text-foreground">{award.cap}</b> of {award.ballot.length}. Voting for a game
              again takes the vote back.{" "}
              {hidden
                ? "Counts stay hidden until close."
                : "Members can't see the counts until close; you see them as staff."}
            </>
          ) : (
            "Voting has closed. The votes are being counted."
          )}
        </p>
        {open && <CapTicks award={award.award} used={votes.votes.length} cap={award.cap} />}
      </div>
      {votes.notice && (
        <NoticeSlip title="Oldest vote dropped" onDismiss={votes.clearNotice} className="max-w-[30rem] self-end">
          You can vote for {award.cap} games for {award.name}. Your vote for{" "}
          <strong>{gameTitle(award, votes.notice.dropped)}</strong> made room for{" "}
          <strong>{gameTitle(award, votes.notice.added)}</strong>.
        </NoticeSlip>
      )}
      {votes.error && <VoteError role="alert" message={votes.error} onDismiss={votes.clearError} className="border-destructive/50" />}
      <ul className="grid grid-cols-2 gap-x-3.5 gap-y-6 sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] sm:gap-x-5.5 sm:gap-y-7.5">
        {award.ballot.map((game) => (
          <BallotCard
            key={game.game_id}
            award={award.award}
            game={game}
            note={goty ? nominatedBy(nominations.get(game.game_id), viewerId) : ""}
            count={hidden ? null : (votesFor(award, game.game_id) ?? 0)}
            voted={votes.votes.includes(game.game_id)}
            canVote={open}
            pending={votes.pending === game.game_id}
            busy={votes.busy}
            onVote={() => votes.vote(game.game_id)}
          />
        ))}
      </ul>
      <div className="flex justify-end border-t border-border pt-4">
        <Button type="button" variant="outline" onClick={onNext}>
          Next: {nextName}
          <ArrowRight data-icon="inline-end" />
        </Button>
      </div>
    </section>
  );
}
