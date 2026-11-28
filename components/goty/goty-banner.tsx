import type { ReactNode } from "react";
import type { GotyVote } from "@/lib/goty/types";
import { gotyClock } from "@/lib/goty/view";
import { GameCover } from "@/components/issue/game-cover";
import { GotyTimeline } from "./goty-timeline";

// The Awards Night banner: the year's GOTM and NR-GOTM winners as a wall of
// covers behind a scrim (the Theme sets the wall's lean and the scrim's
// ink), "GOTY Vote" over the monumental year, the clock, and the schedule
// with its red "Now" marker.
export function GotyBanner({ vote, now, badge }: { vote: GotyVote; now: number; badge: ReactNode }) {
  const wall = vote.awards
    .filter((a) => a.award !== "game_of_the_year")
    .flatMap((a) => a.ballot)
    .slice(0, 18);
  const clock = gotyClock(vote, now);
  return (
    <section data-slot="goty-banner" className="bleed relative isolate -mt-6 flex items-end overflow-hidden md:min-h-[330px]">
      <div aria-hidden data-slot="goty-banner-wall" className="absolute -z-20 grid">
        {wall.map((game, i) => (
          <GameCover key={`${game.game_id}-${i}`} title={game.title} coverUrl={game.cover_url} fallbackClassName="text-sm" />
        ))}
      </div>
      <div aria-hidden data-slot="goty-banner-scrim" className="absolute inset-0 -z-10" />
      <div className="flex w-full flex-col gap-3.5 px-4 pt-10 pb-3 md:px-7 md:pt-14 md:pb-5.5">
        {badge && <div>{badge}</div>}
        <h1 data-slot="goty-banner-title" className="font-headline text-[3.6rem] leading-[0.86] md:text-[5.75rem]">
          <span className="block">GOTY Vote</span>
          <span data-slot="goty-banner-year" className="block">{vote.year}</span>
        </h1>
        <p data-slot="goty-banner-clock" className="flex items-baseline gap-3">
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
