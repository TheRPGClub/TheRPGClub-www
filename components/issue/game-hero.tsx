import type { ReactNode } from "react";
import type { Game } from "@/lib/api/types";
import { GameCover } from "@/components/issue/game-cover";
import { GameHeroStats, type GameHeroStat } from "@/components/issue/game-hero-stats";
import { GameHeroText } from "@/components/issue/game-hero-text";
import { gameTrack } from "@/components/issue/game-track";
import { Starburst } from "@/components/issue/starburst";
import { cn } from "@/lib/utils";

// A game's cover story: full-bleed key art, the box cover, the title in two
// monumental lines, and the club's numbers for it. The starburst is stamped
// only on a game that won GOTM or NR-GOTM.
//
// It bleeds to the edges of the app's content column, so it undoes the
// layout's padding (px-4 py-6, sm:px-7) itself.

export type { GameHeroStat };

export function GameHero({
  game,
  stats,
  releaseDate,
  badge,
  action,
}: {
  game: Game;
  stats: GameHeroStat[];
  releaseDate: string | null;
  // Leads the chip row, e.g. the staff "Preview" badge.
  badge?: ReactNode;
  // A staff action at the hero's top-right (the game page's Edit game).
  action?: ReactNode;
}) {
  const track = gameTrack(game);
  const art = game.art_url;

  return (
    <section
      aria-label={game.title}
      className={cn(
        "relative isolate bleed -mt-6 overflow-hidden bg-black",
        art ? "md:min-h-[430px]" : "md:min-h-[360px]",
      )}
    >
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
          className={cn(
            "absolute top-14 right-3 z-10 size-28 md:right-11 md:size-42",
            action ? "md:top-18" : "md:top-7.5",
          )}
          textClassName={
            track === "gotm"
              ? "text-[0.95rem] md:text-[1.45rem]"
              : "text-[0.8rem] md:text-[1.2rem]"
          }
        />
      )}

      {action && <div className="absolute top-3 right-4 z-20 sm:right-7 md:top-4.5 md:right-8">{action}</div>}

      <div
        className={cn(
          "grid grid-cols-[96px_1fr] gap-x-3.5 gap-y-4 px-4 pb-5 sm:px-7 md:grid-cols-[176px_1fr_auto] md:items-end md:gap-7.5 md:px-8 md:pt-16 md:pb-7.5",
          art || track ? "pt-[150px]" : "pt-14",
          art ? "md:min-h-[430px]" : "md:min-h-[360px]",
        )}
      >
        <GameCover
          title={game.title}
          coverUrl={game.cover_url}
          alt={game.cover_url ? `${game.title} cover art` : undefined}
          className="row-start-1 w-24 shadow-[0_18px_40px_rgb(0_0_0/0.6)] md:w-44"
          fallbackClassName="text-base md:text-[1.7rem]"
        />

        <GameHeroText game={game} track={track} badge={badge} />

        <GameHeroStats stats={stats} releaseDate={releaseDate} />
      </div>
    </section>
  );
}
