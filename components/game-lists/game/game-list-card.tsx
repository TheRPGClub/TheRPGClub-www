import Link from "next/link";
import type { GameListCard as Card } from "@/lib/game-lists/game-cards";
import { GameCover } from "@/components/issue/game-cover";

// One list holding the game, on its page: a strip of the list's covers
// around the game and the list's name. Nothing more: no place, no owner.
export function GameListCard({ card }: { card: Card }) {
  const { list, place } = card;
  return (
    <Link
      href={`/lists/${list.id}`}
      className="group flex min-w-0 flex-col rounded-md bg-card p-3.5 shadow-[inset_0_0_0_1px_var(--color-border)] transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-highlight"
    >
      {place && (
        <div aria-hidden className="mb-3 flex gap-1">
          {place.neighbours.map((game) => (
            <GameCover
              key={game.game_id}
              title={game.title}
              coverUrl={game.cover_url}
              className="w-[calc((100%-1rem)/5)] shrink-0"
              fallbackClassName="hidden"
            />
          ))}
        </div>
      )}
      <h3 className="font-headline text-xl leading-[0.95] transition-colors group-hover:text-highlight">{list.name}</h3>
    </Link>
  );
}
