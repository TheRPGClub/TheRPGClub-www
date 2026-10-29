"use client";

import { useOptimistic, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Crown, Loader2, Vote, X } from "lucide-react";
import { castVoteAction } from "@/app/actions/votes";
import type { VotingCategory } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { BAR_MOTION, type VotingAccent } from "./accents";

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
export function GameBallotPanel({
  category,
  categoryTitle,
  round,
  nominationId,
  count,
  maxCount,
  voted,
  votesUsed,
  cap,
  votingOpen,
  isWinner,
  nominatedBy,
  signedIn,
}: GameBallotPanelProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Same reason the board carries one: the action round-trips and then
  // refreshes, so without this the count and the button sit stale until the
  // new tally lands.
  const [state, toggleOptimistic] = useOptimistic(
    { count, voted, used: votesUsed },
    (prev) =>
      prev.voted
        ? {
            count: Math.max(0, prev.count - 1),
            voted: false,
            used: Math.max(0, prev.used - 1),
          }
        : {
            count: prev.count + 1,
            voted: true,
            // At the cap the backend evicts the oldest vote instead of
            // refusing, so the spend stays put and some other game loses one.
            used: Math.min(cap, prev.used + 1),
          },
  );

  const handleVote = () => {
    setError(null);
    startTransition(async () => {
      toggleOptimistic(null);
      const result = await castVoteAction(category, round, nominationId);
      if (!result.ok) {
        setError(result.error ?? "Failed to cast vote.");
        return;
      }
      router.refresh();
    });
  };

  // A vote landing here changes the leader too, so the bar tracks whichever is
  // larger rather than clipping at a stale maximum.
  const scale = Math.max(maxCount, state.count);

  const gotm = category === "gotm";
  const status = votingOpen ? "On the ballot" : "Was on the ballot";

  return (
    <section
      aria-label={`${categoryTitle} ballot, round ${round}`}
      className="relative overflow-hidden rounded-md border border-rule bg-ink-2 px-4 pt-4 pb-3.5 sm:px-5"
    >
      <span
        aria-hidden
        className={cn(
          "absolute inset-x-0 top-0 h-1",
          gotm ? "bg-gotm" : "bg-nr",
        )}
      />
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
              <span className="font-label ml-2.5 inline-flex translate-y-[-2px] items-center gap-1.5 rounded-xs bg-paper px-1.5 py-px align-middle text-[0.78rem] font-extrabold tracking-[0.08em] text-ink [&_svg]:size-3.5">
                <Crown aria-hidden />
                Won the round
              </span>
            )}
          </h2>
          <p className="mt-0.5 text-[0.85rem] text-paper-dim">
            {status}
            {nominatedBy.length > 0 && (
              <> · nominated by {formatList(nominatedBy)}</>
            )}
          </p>
        </div>
        <div className="col-span-full flex items-center gap-4 sm:col-span-1">
          <p className="font-label text-[0.82rem] font-extrabold tracking-[0.08em] text-paper-dim sm:text-right">
            <span className="font-headline mr-1.5 align-baseline text-[2rem] leading-[0.9] text-paper sm:mr-0 sm:block sm:text-[2.75rem]">
              {state.count}
            </span>
            {state.count === 1 ? "vote" : "votes"}
          </p>

          {votingOpen && signedIn && (
            <Button
              type="button"
              variant={state.voted ? "outline" : "highlight"}
              onClick={handleVote}
              disabled={pending}
              aria-pressed={state.voted}
              className="ml-auto sm:ml-0"
            >
              {pending ? (
                <Loader2 className="animate-spin" />
              ) : state.voted ? (
                <Check />
              ) : (
                <Vote />
              )}
              {state.voted ? "Voted" : "Vote"}
            </Button>
          )}
        </div>
      </div>

      {scale > 0 && (
        // Relative to the leading game's tally, matching the board's bars.
        <Progress
          value={state.count}
          max={scale}
          aria-label={`${state.count} of ${scale} votes`}
          className="mt-3.5"
          indicatorClassName={cn(gotm ? "bg-gotm" : "bg-nr", BAR_MOTION)}
        />
      )}

      {error && (
        <div className="mt-3 flex items-start justify-between gap-3 rounded-sm border border-destructive/40 px-3 py-2 text-sm text-destructive">
          <p>{error}</p>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => setError(null)}
            className="mt-0.5 shrink-0 text-paper-mute transition-colors hover:text-paper"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-[0.8rem] text-paper-mute">
        <span>
          {votingOpen && signedIn ? (
            <>
              You&apos;ve used{" "}
              <span className="font-semibold text-paper">
                {state.used} of {cap}
              </span>{" "}
              votes. Vote again to take this one back.
            </>
          ) : votingOpen ? (
            "Sign in to vote on this round."
          ) : (
            "Voting for this round has closed."
          )}
        </span>
        <Link
          href="/voting"
          className="font-label inline-flex items-center gap-1 text-[0.82rem] font-extrabold tracking-[0.08em] text-paper transition-colors hover:text-highlight [&_svg]:text-gotm"
        >
          See the full ballot
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </section>
  );
}

function formatList(names: string[]): string {
  if (names.length === 1) return names[0];
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}
