"use client";

import { Fragment } from "react";
import { Check, Loader2, Scale, Vote } from "lucide-react";
import type { GotyAward, GotyVote } from "@/lib/goty/types";
import { votesFor } from "@/lib/goty/awards";
import { etDateTime } from "@/lib/goty/dates";
import { useGotyVotes } from "@/hooks/use-goty-votes";
import { Button } from "@/components/ui/button";
import { GameHeadline } from "@/components/issue/game-cover";
import { VoteError } from "@/components/voting/vote-error";
import { AwardCover } from "./award-cover";
import { AWARD_BUTTON } from "./ballot-card";

// A tied Award's runoff as a face-off: the tied games side by side with
// their first count between them ("11 / Tied / 11"), one vote each while
// the runoff is open. Closed (or tied again), it waits for an admin.
export function RunoffFaceOff({ vote, award, open }: { vote: GotyVote; award: GotyAward; open: boolean }) {
  const ids = award.runoff_ballot.length ? award.runoff_ballot : award.pending_tie;
  const games = ids.flatMap((id) => award.ballot.filter((g) => g.game_id === id));
  const votes = useGotyVotes({ year: vote.year, award: award.award, initial: award.own_runoff_votes, cap: 1 });
  const first = games.map((g) => votesFor(award, g.game_id));
  return (
    <section className="flex flex-col gap-5">
      {votes.error && <VoteError role="alert" message={votes.error} onDismiss={votes.clearError} className="border-destructive/50" />}
      <div className="mx-auto mt-2 flex w-full max-w-[700px] items-center justify-center gap-2.5 sm:gap-7">
        {games.map((game, i) => {
          const mine = votes.votes.includes(game.game_id);
          return (
            <Fragment key={game.game_id}>
              {i > 0 && (
                <div className="flex flex-col items-center gap-1.5">
                  <span className="font-headline text-[2.4rem] leading-[0.8] sm:text-[4.5rem]">{first[i - 1] ?? ""}</span>
                  <span className="font-label text-[0.9rem] font-extrabold tracking-[0.08em] text-faint-foreground uppercase">Tied</span>
                  <span className="font-headline text-[2.4rem] leading-[0.8] sm:text-[4.5rem]">{first[i] ?? ""}</span>
                </div>
              )}
              <div className="flex min-w-0 flex-1 flex-col gap-3">
                <AwardCover award={award.award} game={game} ringed={mine} fallbackClassName="text-2xl" />
                <GameHeadline as="h3" title={game.title} className="text-[1.4rem] leading-[0.9] sm:text-[2.6rem]" />
                {open && (
                  <Button
                    type="button"
                    variant={mine ? "outline" : AWARD_BUTTON[award.award]}
                    aria-pressed={mine}
                    aria-label={`${mine ? "Your vote" : "Vote"}: ${game.title}`}
                    disabled={votes.pending !== null}
                    onClick={() => votes.vote(game.game_id)}
                  >
                    {votes.pending === game.game_id ? <Loader2 className="motion-safe:animate-spin" /> : mine ? <Check data-icon="inline-start" /> : <Vote data-icon="inline-start" />}
                    {mine ? "Your vote" : "Vote"}
                  </Button>
                )}
              </div>
            </Fragment>
          );
        })}
      </div>
      <p className="mx-auto flex max-w-[62ch] items-start justify-center gap-2.5 text-[0.92rem] text-dim-foreground">
        <Scale aria-hidden className="mt-0.75 size-4 shrink-0 text-foreground" />
        <span>
          {open && vote.runoff_closes_at
            ? `${award.name} tied in the first count. The runoff has only these ${games.length === 2 ? "two" : games.length}, one vote each, until ${etDateTime(vote.runoff_closes_at)}. If it ties again, an admin decides.`
            : `${award.name} is still tied. An admin picks the winner.`}
        </span>
      </p>
    </section>
  );
}
