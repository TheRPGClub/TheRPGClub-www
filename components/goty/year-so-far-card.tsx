import type { GameSummary } from "@/lib/api/types";
import type { GotyAwardKey } from "@/lib/goty/types";
import { AwardCover } from "./award-cover";
import { WonInNote } from "./won-in-note";

// A game in the Year So Far: the ballot card's cover footed in the Award's
// ink and its title in Anton, without a Vote button. Under it where a GOTM
// / NR-GOTM winner won, or how many members played a club release, set
// like a ballot's count.
export function YearSoFarCard({
  award,
  game,
  note,
  played,
}: {
  award: GotyAwardKey;
  game: Pick<GameSummary, "game_id" | "title" | "cover_url">;
  note: string;
  played: number | null;
}) {
  return (
    <li className="flex flex-col gap-1.5">
      <AwardCover award={award} game={game} fallbackClassName="text-sm sm:text-base" />
      <h3 className="font-headline mt-0.5 text-[1rem] leading-[0.95] break-words sm:text-[1.3rem]">{game.title}</h3>
      <WonInNote label={note} className="text-[0.7rem] sm:text-[0.78rem]" />
      {played !== null && (
        <p className="flex flex-wrap items-baseline gap-x-1.25">
          <span className="font-headline text-[1.4rem] leading-[0.9] sm:text-[1.8rem]">{played}</span>
          <span className="font-label text-[0.7rem] font-extrabold tracking-[0.08em] text-faint-foreground uppercase sm:text-[0.78rem]">
            {played === 1 ? "member played" : "members played"}
          </span>
        </p>
      )}
    </li>
  );
}
