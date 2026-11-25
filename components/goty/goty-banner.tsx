import type { ReactNode } from "react";
import type { GotyVote } from "@/lib/goty/types";
import { gotyClock } from "@/lib/goty/view";
import { GameCover } from "@/components/issue/game-cover";
import { GotyTimeline } from "./goty-timeline";

// The Awards Night banner: the year's GOTM and NR-GOTM winners as a tilted
// wall of covers behind an ink scrim, "GOTY Vote" over the monumental year,
// the clock, and the schedule with its red "Now" marker.
export function GotyBanner({ vote, now, badge }: { vote: GotyVote; now: number; badge: ReactNode }) {
  const wall = vote.awards
    .filter((a) => a.award !== "game_of_the_year")
    .flatMap((a) => a.ballot)
    .slice(0, 18);
  const clock = gotyClock(vote, now);
  return (
    <section className="bleed relative isolate -mt-6 flex items-end overflow-hidden md:min-h-[330px]">
      <div
        aria-hidden
        className="absolute -top-5 -right-10 -z-20 grid w-[120%] rotate-[-4deg] grid-cols-6 gap-2 opacity-50 md:w-[68%] md:opacity-85"
      >
        {wall.map((game, i) => (
          <GameCover key={`${game.game_id}-${i}`} title={game.title} coverUrl={game.cover_url} fallbackClassName="text-sm" />
        ))}
      </div>
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,var(--color-background)_0%,color-mix(in_oklab,var(--color-background)_90%,transparent)_38%,color-mix(in_oklab,var(--color-background)_35%,transparent)_75%,color-mix(in_oklab,var(--color-background)_15%,transparent)),linear-gradient(0deg,var(--color-background)_0%,transparent_55%)]"
      />
      <div className="flex w-full flex-col gap-3.5 px-4 pt-10 pb-3 md:px-7 md:pt-14 md:pb-5.5">
        {badge && <div>{badge}</div>}
        <h1 className="font-headline text-[3.6rem] leading-[0.86] md:text-[5.75rem]">
          <span className="block">GOTY Vote</span>
          <span className="block">{vote.year}</span>
        </h1>
        <p className="flex items-baseline gap-3">
          {clock.figure && (
            <span className="font-headline text-[2.4rem] leading-[0.8] text-highlight md:text-5xl">{clock.figure}</span>
          )}
          <span className="font-label text-base leading-tight font-extrabold tracking-[0.08em] uppercase">
            {clock.label}
            {clock.detail && (
              <span className="mt-0.5 block font-sans text-[0.85rem] font-medium tracking-normal text-faint-foreground normal-case">
                {clock.detail}
              </span>
            )}
          </span>
        </p>
        <GotyTimeline vote={vote} now={now} />
      </div>
    </section>
  );
}
