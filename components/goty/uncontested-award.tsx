import type { GotyAward, GotyVote } from "@/lib/goty/types";
import { etDay } from "@/lib/goty/dates";
import { wonInLabel } from "@/lib/goty/awards";
import { Badge } from "@/components/ui/badge";
import { GameHeadline } from "@/components/issue/game-cover";
import { AwardCover } from "./award-cover";
import { WonInNote } from "./won-in-note";

// An Award with a single candidate: no vote, it wins at close. Its cover
// beside an "Uncontested" chip, the game's two-line headline and why.
export function UncontestedAward({ vote, award }: { vote: GotyVote; award: GotyAward }) {
  const [game] = award.ballot;
  return (
    <div className="grid items-end gap-4 rounded-[3.2px] bg-card p-4 sm:grid-cols-[220px_minmax(0,1fr)] sm:gap-7 sm:p-6">
      <AwardCover award={award.award} game={game} className="w-35 sm:w-auto" fallbackClassName="text-2xl" />
      <div>
        <Badge tone="outline">Uncontested</Badge>
        <GameHeadline as="h2" title={game.title} className="mt-2.5 mb-3 text-5xl leading-[0.9] sm:text-[4.5rem]" />
        <WonInNote label={wonInLabel(game.won_in)} className="-mt-1.5 mb-3" />
        <p className="max-w-[52ch] text-dim-foreground">
          {game.title} is the only game on the {award.name} ballot, so it wins when voting closes on{" "}
          {etDay(vote.voting_closes_at)}. There is nothing to vote on here.
        </p>
      </div>
    </div>
  );
}
