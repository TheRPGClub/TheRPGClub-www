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
import { accentClasses, BAR_MOTION, type VotingAccent } from "./accents";

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
  accent,
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
  const accentStyle = accentClasses[accent];

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

  return (
    <section
      aria-label={`${categoryTitle} ballot, round ${round}`}
      className={cn(
        "space-y-3 rounded-xl border bg-card p-4 sm:p-5",
        accentStyle.own,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
        <div className="min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em]",
                accentStyle.pill,
              )}
            >
              {votingOpen ? "On the ballot" : "Was on the ballot"}
            </span>
            {isWinner && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <Crown className={cn("size-3.5", accentStyle.crown)} />
                Won the round
              </span>
            )}
          </div>
          <p className="text-sm font-semibold tracking-tight">
            Round {round} · {categoryTitle}
          </p>
          {nominatedBy.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Nominated by {formatList(nominatedBy)}
            </p>
          )}
        </div>

        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground">
            <span
              className={cn(
                "text-2xl font-semibold tabular-nums",
                accentStyle.count,
              )}
            >
              {state.count}
            </span>{" "}
            {state.count === 1 ? "vote" : "votes"}
          </p>

          {votingOpen && signedIn && (
            <Button
              type="button"
              variant={state.voted ? "secondary" : "default"}
              onClick={handleVote}
              disabled={pending}
              aria-pressed={state.voted}
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
          indicatorClassName={cn(accentStyle.bar, BAR_MOTION)}
        />
      )}

      {error && (
        <div className="flex items-start justify-between gap-3 rounded-lg border border-destructive/40 px-3 py-2 text-sm text-destructive">
          <p>{error}</p>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => setError(null)}
            className="mt-0.5 shrink-0 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span>
          {votingOpen && signedIn ? (
            <>
              You&apos;ve used{" "}
              <span className={cn("font-semibold", accentStyle.count)}>
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
          className="inline-flex items-center gap-1 font-medium transition-colors hover:text-foreground"
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
