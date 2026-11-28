import Link from "next/link";
import type { GameList, GameListGame } from "@/lib/game-lists/types";
import { leadWith } from "@/lib/game-lists/order";
import { cn } from "@/lib/utils";
import { GameCover } from "@/components/issue/game-cover";
import { ListMeta } from "@/components/game-lists/list-byline";
import type { ListHit } from "@/components/game-lists/search-hit";

// A member's list on the index (pick 1C): a 2 by 2 mosaic of its first
// covers with the count stamped in its corner, then the name and byline.
// Searching by a game leads the mosaic with it, ringed in yellow, and tags
// its place on a ranked list. Empty slots stay as muted wells. The name's
// link stretches over the card; the owner opens their profile.
export function ListMosaic({
  list,
  covers,
  leadGameId = null,
  hit,
}: {
  list: GameList;
  // Its covers when read whole; the preview's four otherwise.
  covers?: readonly GameListGame[];
  leadGameId?: number | null;
  hit?: ListHit | null;
}) {
  const games = leadWith(covers ?? list.preview_games, leadGameId).slice(0, 4);
  return (
    <article data-slot="list-mosaic" className="group relative min-w-0">
      <div data-slot="list-mosaic-covers" className="relative grid grid-cols-2 gap-[3px] overflow-hidden rounded-md">
        {Array.from({ length: 4 }, (_, i) => {
          const game = games[i];
          return game ? (
            <GameCover
              key={game.game_id}
              title={game.title}
              coverUrl={game.cover_url}
              className={cn(
                "w-full rounded-none motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-[1.03]",
                i === 0 && leadGameId !== null && game.game_id === leadGameId && "z-[1] outline-3 -outline-offset-3 outline-highlight",
              )}
              fallbackClassName="p-1.5 text-sm"
            />
          ) : (
            <div key={`empty-${i}`} aria-hidden className="aspect-[3/4] bg-muted" />
          );
        })}
        {hit?.place != null && (
          <span className="font-headline absolute top-1.5 left-1.5 z-[2] rounded-xs bg-highlight px-1.5 pt-1 pb-0.5 text-lg leading-none text-highlight-foreground">
            No. {hit.place}
          </span>
        )}
        <span className="font-headline absolute right-1.5 bottom-1.5 z-[2] rounded-xs bg-background/86 px-2 pt-1.5 pb-1 text-[1.6rem] leading-[0.85]">
          {list.entry_count}
        </span>
      </div>
      <h3 className="font-headline mt-2.5 line-clamp-2 text-xl leading-[0.95] transition-colors group-hover:text-highlight">
        <Link
          href={`/lists/${list.id}`}
          className="outline-none after:absolute after:inset-0 after:rounded-md after:content-[''] focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-highlight"
        >
          {list.name}
        </Link>
      </h3>
      <ListMeta list={list} extra={list.visibility === "private" ? "Private" : undefined} className="mt-1.5 text-[0.74rem]" />
    </article>
  );
}
