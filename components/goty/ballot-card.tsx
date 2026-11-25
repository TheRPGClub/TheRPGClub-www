import { Check, Loader2, Vote } from "lucide-react";
import type { GameSummary } from "@/lib/api/types";
import type { GotyAwardKey } from "@/lib/goty/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AwardCover } from "./award-cover";

// The Award's own action: red for GOTM, violet for NR-GOTM, paper for Game
// of the Year (each Award votes in its own ink).
export const AWARD_BUTTON = { gotm: "default", nr_gotm: "nr", game_of_the_year: "paper" } as const;
export const AWARD_TONE = { gotm: "gotm", nr_gotm: "nr", game_of_the_year: "inverse" } as const;

// A candidate on an Award's ballot: a big cover ringed in the Award's ink
// once voted (with a Voted chip), the title in Anton, who nominated it (Game
// of the Year), its count once counts show, and the Vote toggle.
export function BallotCard({
  award,
  game,
  note,
  count,
  voted,
  canVote,
  pending,
  busy,
  onVote,
}: {
  award: GotyAwardKey;
  game: GameSummary;
  note: string;
  count: number | null;
  voted: boolean;
  canVote: boolean;
  // This card's vote is being cast (its spinner).
  pending: boolean;
  // Any vote on the Award is being cast: every Vote button waits.
  busy: boolean;
  onVote: () => void;
}) {
  return (
    <li className="flex flex-col gap-2">
      <AwardCover
        award={award}
        game={game}
        ringed={voted}
        fallbackClassName="text-xl"
        mark={
          voted && (
            <Badge tone={AWARD_TONE[award]}>
              <Check data-icon="inline-start" />
              Voted
            </Badge>
          )
        }
      />
      <h3 className="font-headline mt-0.5 text-[1.2rem] leading-[0.95] break-words sm:text-[1.6rem]">{game.title}</h3>
      {note && <p className="font-label text-[0.78rem] font-extrabold tracking-[0.08em] text-faint-foreground uppercase">{note}</p>}
      <div className="mt-auto flex flex-col items-stretch gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-2.5">
        {count !== null && (
          <span className="flex items-baseline gap-1.25">
            <span className="font-headline text-[1.8rem] leading-[0.9]">{count}</span>
            <span className="font-label text-[0.78rem] font-extrabold tracking-[0.08em] text-faint-foreground uppercase">
              {count === 1 ? "vote" : "votes"}
            </span>
          </span>
        )}
        {canVote && (
          <Button
            type="button"
            variant={voted ? "outline" : AWARD_BUTTON[award]}
            aria-pressed={voted}
            aria-label={`${voted ? "Voted" : "Vote"}: ${game.title}`}
            disabled={busy}
            onClick={onVote}
            className="flex-1 sm:max-w-36"
          >
            {pending ? <Loader2 className="motion-safe:animate-spin" /> : voted ? <Check data-icon="inline-start" /> : <Vote data-icon="inline-start" />}
            {voted ? "Voted" : "Vote"}
          </Button>
        )}
      </div>
    </li>
  );
}
