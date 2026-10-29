import Link from "next/link";
import type { UserFavorite } from "@/lib/api/types";
import { MemberCover } from "@/components/issue/member-cover";
import { cn } from "@/lib/utils";

// A member's top three favorites on a podium: first in the middle and
// highest, second on the left, third on the right, each cover standing on a
// numbered step. Everything ranked after sits level below it.

const SLOTS = [
  // In rank order for reading; placed into columns 2-1-3 on screen.
  { i: 0, step: "h-22 sm:h-32", width: "w-full" },
  { i: 1, step: "h-14 sm:h-20", width: "w-[88%]" },
  { i: 2, step: "h-9 sm:h-12", width: "w-[80%]" },
];

export function FavoritesPodium({ entries }: { entries: UserFavorite[] }) {
  return (
    <ol
      aria-label="Top three"
      className="grid grid-cols-[1fr_1.15fr_1fr] items-end gap-2.5 border-b-2 border-paper sm:mx-auto sm:max-w-[46rem] sm:gap-5"
    >
      {SLOTS.filter((slot) => slot.i < entries.length).map((slot) => {
        const entry = entries[slot.i];
        const game = entry.game;
        const title = game?.title ?? "Unknown game";
        const cover = (
          <MemberCover
            game={game}
            platform={entry.platform}
            className={cn("mx-auto shadow-[0_12px_28px_rgb(0_0_0/0.5)]", slot.width)}
          />
        );
        return (
          <li
            key={slot.i}
            className={cn(
              "flex flex-col",
              slot.i === 0 ? "col-start-2" : slot.i === 1 ? "col-start-1" : "col-start-3",
            )}
            style={{ gridRow: 1 }}
          >
            {game ? (
              <Link href={`/games/${game.game_id}`} className="group/cover block">
                {cover}
              </Link>
            ) : (
              cover
            )}
            <p className="font-label mt-2.5 line-clamp-2 text-center text-[0.85rem] leading-tight font-bold tracking-[0.02em] sm:text-base">
              {game ? (
                <Link
                  href={`/games/${game.game_id}`}
                  className="transition-colors hover:text-highlight"
                >
                  {title}
                </Link>
              ) : (
                title
              )}
            </p>
            {entry.note && (
              <p className="mt-1 line-clamp-2 text-center text-xs text-paper-dim italic max-sm:hidden">
                &ldquo;{entry.note}&rdquo;
              </p>
            )}
            <span
              className={cn(
                "font-headline mt-3 grid place-items-center border-t-2 border-paper bg-ink-3 leading-none",
                slot.step,
                slot.i === 0 ? "text-5xl sm:text-7xl" : "text-4xl sm:text-5xl",
              )}
            >
              <span className="sr-only">Rank </span>
              {slot.i + 1}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
