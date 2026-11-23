import type { ReactNode } from "react";
import type { Game } from "@/lib/api/types";
import { GameCover } from "@/components/issue/game-cover";
import { GameHeroText } from "@/components/issue/game-hero-text";
import { gameTrack } from "@/components/issue/game-track";
import { Starburst } from "@/components/issue/starburst";
import { BackLink } from "@/components/shell/back-link";
import { cn } from "@/lib/utils";

// A game's cover story (design www#156, round 3): full-bleed key art, the way
// back to Games at the banner's top-left and the staff action at its
// top-right on one line, then the box cover centred on and as tall as the
// title block (title in two monumental lines, chips, blurb with IGDB beside
// it). The club's panel (`panel`) sits on a translucent ink plate over the
// hero's foot. The starburst is stamped only on a GOTM or NR-GOTM winner.
//
// It bleeds to the edges of the app's content column, so it undoes the
// layout's padding (px-4 py-6, sm:px-7) itself.
export function GameHero({
  game,
  badge,
  action,
  panel,
}: {
  game: Game;
  // Leads the chip row, e.g. the staff "Preview" badge.
  badge?: ReactNode;
  // A staff action at the banner's top-right (the game page's Edit game).
  action?: ReactNode;
  // The plate over the hero's foot (time to beat, who's playing...).
  panel?: ReactNode;
}) {
  const track = gameTrack(game);
  const art = game.art_url;

  return (
    <section aria-label={game.title} className="relative isolate bleed -mt-6 overflow-hidden bg-black">
      {art && (
        // eslint-disable-next-line @next/next/no-img-element -- remote game art from the API's image hosts, which next/image isn't configured for
        <img
          src={art}
          alt=""
          className="absolute inset-x-0 top-0 -z-20 h-[300px] w-full object-cover object-[62%_30%] md:inset-0 md:h-full md:object-[62%_28%]"
        />
      )}
      {/* Legibility scrims: ink across the text column and rising from the
          foot; on a phone, ink rising over the shorter art band. */}
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 -z-10",
          art
            ? "bg-[linear-gradient(0deg,var(--color-background)_8%,color-mix(in_oklab,var(--color-background)_82%,transparent)_52%,color-mix(in_oklab,var(--color-background)_35%,transparent)_100%)] md:bg-[linear-gradient(90deg,color-mix(in_oklab,var(--color-background)_97%,transparent)_0%,color-mix(in_oklab,var(--color-background)_80%,transparent)_38%,color-mix(in_oklab,var(--color-background)_5%,transparent)_72%),linear-gradient(0deg,var(--color-background)_0%,color-mix(in_oklab,var(--color-background)_0%,transparent)_46%)]"
            : "bg-[linear-gradient(0deg,var(--color-background)_0%,var(--color-card)_100%)]",
        )}
      />

      {track && (
        <Starburst
          track={track}
          rotate={8}
          className="absolute top-14 right-3 z-10 size-28 md:top-18 md:right-11 md:size-42"
          textClassName={
            track === "gotm"
              ? "text-[0.95rem] md:text-[1.45rem]"
              : "text-[0.8rem] md:text-[1.2rem]"
          }
        />
      )}

      {/* The banner's top line: the way back at left, the staff action at
          right, both pinned to the top edge. */}
      <div className="absolute inset-x-4 top-3 z-20 flex items-center justify-between gap-2.5 sm:inset-x-7 md:inset-x-8 md:top-4.5 md:gap-4">
        <BackLink href="/games" label="Games" onArt className="mb-0 self-center max-md:ml-0" />
        {action}
      </div>

      <div
        className={cn(
          "grid grid-cols-[84px_minmax(0,1fr)] items-center gap-x-3.5 gap-y-3.5 px-4 pb-4 sm:px-7 md:grid-cols-[auto_minmax(0,1fr)] md:gap-x-7.5 md:px-8 md:pt-19 md:pb-5.5",
          art || track ? "pt-[150px]" : "pt-16",
        )}
      >
        {/* As tall as the title block beside it, at 3:4 (the grid's second
            column pass sizes it from the stretched height); a floor keeps
            it a cover where that pass is missing. */}
        <GameCover
          title={game.title}
          coverUrl={game.cover_url}
          alt={game.cover_url ? `${game.title} cover art` : undefined}
          className="row-start-1 w-21 shadow-[0_18px_40px_rgb(0_0_0/0.6)] md:w-auto md:min-w-30 md:self-stretch"
          fallbackClassName="text-base md:text-[1.7rem]"
        />
        <GameHeroText game={game} track={track} badge={badge} />
      </div>

      {panel}
    </section>
  );
}
