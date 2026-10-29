import { ExternalLink } from "lucide-react";
import type { Game } from "@/lib/api/types";
import { Chip } from "@/components/issue/chip";
import { GameCover, GameHeadline } from "@/components/issue/game-cover";
import { gameTrack, trackAccentText, trackChips } from "@/components/issue/game-track";
import { Starburst } from "@/components/issue/starburst";
import { PlatformPills } from "@/components/platform-pills";
import { cn } from "@/lib/utils";

// A game's cover story: full-bleed key art, the box cover, the title in two
// monumental lines, and the club's numbers for it. The starburst is stamped
// only on a game that won GOTM or NR-GOTM.
//
// It bleeds to the edges of the app's content column, so it undoes the
// layout's padding (px-4 py-6, sm:px-7) itself.

export interface GameHeroStat {
  label: string;
  value: number;
}

export function GameHero({
  game,
  stats,
  releaseDate,
}: {
  game: Game;
  stats: GameHeroStat[];
  releaseDate: string | null;
}) {
  const track = gameTrack(game);
  const art = game.art_url;
  const chips = trackChips(game);

  return (
    <section
      aria-label={game.title}
      className={cn(
        "relative isolate -mx-4 -mt-6 overflow-hidden bg-black sm:-mx-7",
        art ? "md:min-h-[430px]" : "md:min-h-[360px]",
      )}
    >
      {art && (
        // eslint-disable-next-line @next/next/no-img-element
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
            ? "bg-[linear-gradient(0deg,var(--color-ink)_8%,rgb(11_11_13/0.82)_52%,rgb(11_11_13/0.35)_100%)] md:bg-[linear-gradient(90deg,rgb(11_11_13/0.97)_0%,rgb(11_11_13/0.8)_38%,rgb(11_11_13/0.05)_72%),linear-gradient(0deg,var(--color-ink)_0%,rgb(11_11_13/0)_46%)]"
            : "bg-[linear-gradient(0deg,var(--color-ink)_0%,var(--color-ink-2)_100%)]",
        )}
      />

      {track && (
        <Starburst
          track={track}
          rotate={8}
          className="absolute top-14 right-3 z-10 size-28 md:top-7.5 md:right-11 md:size-42"
          textClassName={
            track === "gotm"
              ? "text-[0.95rem] md:text-[1.45rem]"
              : "text-[0.8rem] md:text-[1.2rem]"
          }
        />
      )}

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

        <div className="col-span-full min-w-0 md:col-span-1 md:row-start-1 md:col-start-2">
          <GameHeadline
            title={game.title}
            accentClassName={trackAccentText(track)}
            className="text-[3.1rem] leading-[0.88] md:text-[5.5rem]"
          />
          {(chips.length > 0 || (game.platforms?.length ?? 0) > 0) && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {chips.map((chip) => (
                <Chip key={chip.tone} tone={chip.tone}>
                  {chip.label}
                </Chip>
              ))}
              <PlatformPills platforms={game.platforms} max={5} />
            </div>
          )}
          {game.description && (
            <p className="mt-3.5 line-clamp-4 max-w-[60ch] text-[0.9rem] leading-[1.55] text-paper-dim">
              {game.description}
            </p>
          )}
          {game.igdb_url && (
            <a
              href={game.igdb_url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-label mt-2.5 inline-flex items-center gap-1.5 text-[0.85rem] font-extrabold tracking-[0.08em] text-paper-dim transition-colors hover:text-highlight"
            >
              View on IGDB
              <ExternalLink aria-hidden className="size-3.5" />
            </a>
          )}
        </div>

        <dl className="col-start-2 row-start-1 flex items-end gap-4 self-end md:col-start-3 md:gap-7 md:pb-1.5">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col-reverse md:text-right">
              <dt className="font-label text-[0.75rem] font-extrabold tracking-[0.08em] text-paper-dim md:text-[0.82rem]">
                {stat.label}
              </dt>
              <dd className="font-headline text-[2.5rem] leading-[0.9] md:text-[3.75rem]">
                {stat.value}
              </dd>
            </div>
          ))}
          {releaseDate && (
            <div className="hidden flex-col-reverse text-right lg:flex">
              <dt className="font-label text-[0.82rem] font-extrabold tracking-[0.08em] text-paper-dim">
                Released
              </dt>
              <dd className="font-headline mb-0.5 text-[1.9rem] leading-none">
                {releaseDate}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </section>
  );
}
