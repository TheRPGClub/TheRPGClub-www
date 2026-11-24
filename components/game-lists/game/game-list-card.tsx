import Link from "next/link";
import type { GameListCard as Card } from "@/lib/game-lists/game-cards";
import { placeLabel, gamesCount } from "@/lib/game-lists/text";
import { cn } from "@/lib/utils";
import { GameCover } from "@/components/issue/game-cover";
import { ListOwner } from "@/components/game-lists/list-byline";

// One list holding the game, on its page (pick 5C): led by the game's
// place in Anton ("No. 2 of 10", or the list's order), a strip of its
// neighbouring covers with this game ringed in paper, the name and owner.
export function GameListCard({ card, gameId }: { card: Card; gameId: number }) {
  const { list, place } = card;
  const label = place ? placeLabel(list, place.place, place.of) : { big: gamesCount(list.entry_count), small: "" };
  return (
    <Link
      href={`/lists/${list.id}`}
      className="group grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3.5 gap-y-1 rounded-md bg-card p-3.5 shadow-[inset_0_0_0_1px_var(--color-border)] transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-highlight sm:flex sm:flex-col sm:items-stretch sm:gap-0"
    >
      <p className="flex items-end gap-2 max-sm:row-span-2 max-sm:flex-col max-sm:items-start max-sm:gap-1">
        <b className="font-headline text-[2.2rem] leading-[0.8] font-normal sm:text-[3rem]">{label.big}</b>
        {label.small && (
          <small className="font-label pb-0.5 text-[0.72rem] font-bold tracking-[0.08em] text-faint-foreground">{label.small}</small>
        )}
      </p>
      {place && (
        <div aria-hidden className="my-3 flex gap-1 max-sm:hidden">
          {place.neighbours.map((game) => (
            <GameCover
              key={game.game_id}
              title={game.title}
              coverUrl={game.cover_url}
              className={cn("w-[calc((100%-1rem)/5)] shrink-0", game.game_id === gameId && "shadow-[0_0_0_2px_var(--color-card),0_0_0_3.5px_var(--color-foreground)]")}
              fallbackClassName="hidden"
            />
          ))}
        </div>
      )}
      <h3 className="font-headline text-xl leading-[0.95] transition-colors group-hover:text-highlight">{list.name}</h3>
      <p className="font-label text-[0.74rem] font-bold tracking-[0.08em] text-dim-foreground sm:mt-auto sm:pt-2.5">
        <ListOwner list={list} />
      </p>
    </Link>
  );
}
