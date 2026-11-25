import Link from "next/link";
import { Check } from "lucide-react";
import { coverState, playtimeTag } from "@/lib/franchises/progress";
import type { FranchiseProgressGame } from "@/lib/franchises/types";
import { cn } from "@/lib/utils";
import { GameCover } from "@/components/issue/game-cover";

// One cover on the Progress tab's wall (pick 1E1), linking to its game. A
// finished game is in full colour with the paper check tab in its corner;
// one played but unfinished is grey; one never played is darker grey. Every
// cover carries its Playtime tag on its foot. Mainline covers sit over
// their Roman numeral and year, spin-offs over their title.
export function ProgressCover({
  game,
  numeral,
  big,
  className,
}: {
  game: FranchiseProgressGame;
  // The Mainline numeral; null for a spin-off.
  numeral: string | null;
  big: boolean;
  className?: string;
}) {
  const state = coverState(game);
  const tag = playtimeTag(game);
  const label = `${game.title}: ${state === "done" ? "finished" : state === "played" ? "not finished" : "not played"}, ${tag.text}`;
  return (
    <li className={cn("min-w-0", className)}>
      <Link
        href={`/games/${game.game_id}`}
        aria-label={label}
        className="relative block rounded-sm focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-highlight"
      >
        <GameCover
          title={game.title}
          coverUrl={game.cover_url}
          className={cn(
            "w-full",
            state === "played" && "brightness-[0.62] grayscale",
            state === "unplayed" && "brightness-[0.32] grayscale",
          )}
          fallbackClassName={big ? "p-2 text-[0.9rem]" : "p-1.5 text-[0.7rem]"}
        />
        {state === "done" && (
          <span
            aria-hidden
            className={cn(
              "absolute top-0 right-0 z-[2] grid place-items-center rounded-tr-sm rounded-bl-sm bg-foreground text-background",
              big ? "size-[26px]" : "size-5",
            )}
          >
            <Check className={cn("stroke-3", big ? "size-4" : "size-[13px]")} />
          </span>
        )}
        <span
          aria-hidden
          className={cn(
            "absolute z-[2] rounded-xs bg-background/86",
            big ? "bottom-1.5 left-1.5" : "bottom-1 left-1",
            tag.quiet
              ? "font-label px-[5px] pt-1 pb-[3px] text-[0.64rem] leading-none font-extrabold tracking-[0.07em] text-faint-foreground"
              : cn("font-headline leading-none text-foreground", big ? "px-1.5 pt-1 pb-[3px] text-base" : "px-[5px] pt-[3px] pb-[2px] text-[0.82rem]"),
          )}
        >
          {tag.text}
        </span>
      </Link>
      {numeral ? (
        <p aria-hidden className="mt-1.5 flex items-baseline justify-between gap-1.5">
          <b className={cn("font-headline text-[1.3rem] leading-[0.9] font-normal sm:text-[1.7rem]", state !== "done" && "text-faint-foreground")}>
            {numeral}
          </b>
          <span className="text-[0.82rem] text-faint-foreground">{game.release_year ?? "TBA"}</span>
        </p>
      ) : (
        <p aria-hidden className="mt-[5px] line-clamp-2 text-[0.76rem] leading-[1.2] text-dim-foreground">
          {game.title}
        </p>
      )}
    </li>
  );
}
