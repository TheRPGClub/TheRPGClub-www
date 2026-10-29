import Link from "next/link";
import type { Game } from "@/lib/api/types";
import { Chip } from "@/components/issue/chip";
import { splitGameTitle } from "@/components/issue/game-cover";
import { gameTrack, trackAccentText, trackChips } from "@/components/issue/game-track";
import { cn } from "@/lib/utils";

// The short key-art banner over a game's departments (its reviews): the
// game's name on one line, its second half in the track's accent, and the
// win chips. Bleeds to the content column's edges like the game's own hero.
export function GameStrip({ game }: { game: Game }) {
  const track = gameTrack(game);
  const [first, second] = splitGameTitle(game.title);
  const art = game.art_url;
  const year = game.initial_release_date
    ? new Date(game.initial_release_date).getUTCFullYear()
    : null;

  return (
    <section
      aria-label={game.title}
      className="relative isolate -mx-4 -mt-6 h-[140px] overflow-hidden bg-ink-2 sm:-mx-7 md:h-[180px]"
    >
      {art && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={art}
          alt=""
          className="absolute inset-0 -z-20 size-full object-cover object-[62%_30%]"
        />
      )}
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 -z-10",
          art
            ? "bg-[linear-gradient(90deg,rgb(11_11_13/0.96)_0%,rgb(11_11_13/0.72)_45%,rgb(11_11_13/0.2)_100%),linear-gradient(0deg,var(--color-ink)_0%,transparent_60%)]"
            : "bg-[linear-gradient(0deg,var(--color-ink)_0%,transparent_100%)]",
        )}
      />
      <div className="flex h-full flex-col justify-between px-4 py-3.5 sm:px-7 md:px-8 md:py-5.5">
        <div>
          <p className="font-headline line-clamp-2 text-[2rem] leading-[0.9] md:text-[2.9rem]">
            <Link
              href={`/games/${game.game_id}`}
              className="transition-opacity hover:opacity-85"
            >
              {first && <>{first} </>}
              <span className={trackAccentText(track)}>{second}</span>
            </Link>
          </p>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {trackChips(game, { short: true }).map((chip) => (
              <Chip key={chip.tone} tone={chip.tone}>
                {chip.label}
              </Chip>
            ))}
            {year && <Chip>{year}</Chip>}
          </div>
        </div>
      </div>
    </section>
  );
}
