import Link from "next/link";
import type { Game } from "@/lib/api/types";
import { WinnerMark } from "@/components/issue/browse-winner-mark";
import { cn } from "@/lib/utils";

// One game in the games index's cover grid: the box cover, footed in its
// track's ink and stamped with a badge-sized starburst when the club made it a
// Game of the Month. A game without a cover gets an ink block with its title
// set in the headline face.

export function BrowseGameCard({ game }: { game: Game }) {
  const cover = game.cover_url ?? game.art_url;
  const year = game.initial_release_date
    ? new Date(game.initial_release_date).getFullYear()
    : null;
  // A game can have won both; GOTM leads the stamp, the meta line says both.
  const track = game.gotm_won ? "gotm" : game.nr_gotm_won ? "nr_gotm" : null;

  return (
    <Link href={`/games/${game.game_id}`} className="group/card relative block">
      {track && (
        <WinnerMark
          track={track}
          className="absolute -top-2.5 -right-2.5 size-13.5 sm:size-15.5"
        />
      )}
      <span
        className={cn(
          "relative block aspect-[3/4] overflow-hidden rounded-sm bg-ink-3 shadow-[inset_0_0_0_1px_rgb(244_244_240/0.06)]",
          track &&
            "after:absolute after:inset-x-0 after:bottom-0 after:h-1",
          track === "gotm" && "after:bg-gotm",
          track === "nr_gotm" && "after:bg-nr",
        )}
      >
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt=""
            loading="lazy"
            className="size-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover/card:scale-[1.04]"
          />
        ) : (
          <span className="font-headline grid size-full place-items-center p-3 text-center text-2xl leading-[0.95] text-balance text-paper-mute">
            {game.title}
          </span>
        )}
      </span>
      <span className="font-label mt-2.5 line-clamp-2 text-base leading-[1.15] font-bold tracking-[0.02em] text-paper transition-colors group-hover/card:text-highlight">
        {game.title}
      </span>
      <span className="font-label mt-0.5 flex flex-wrap gap-x-2 text-[0.8rem] font-bold tracking-[0.08em] text-paper-mute">
        {year && <span>{year}</span>}
        {game.gotm_won && <span className="text-gotm-soft">GOTM winner</span>}
        {game.nr_gotm_won && <span className="text-nr-soft">NR-GOTM winner</span>}
      </span>
    </Link>
  );
}
