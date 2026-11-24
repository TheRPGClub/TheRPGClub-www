import type { GameListGame } from "@/lib/game-lists/types";
import { cn } from "@/lib/utils";
import { GameCover } from "@/components/issue/game-cover";

// A club list's covers as a hand of cards (pick 1A + 1C): up to four sit as
// a shuffled deck, each a little off true; the fifth spreads the deck into a
// fan pivoting on its foot. Decorative: the list's name says what it is.

const DECK_TILT = [-4, 2, -1.5, 5];
const DECK_LIFT = [0, 6, 2, 4];
const FAN_TILT = [-12, -6, 0, 6, 12];

export function CoverDeck({ games, className }: { games: readonly GameListGame[]; className?: string }) {
  const shown = games.slice(0, 5);
  const fan = shown.length === 5;
  if (shown.length === 0) {
    return (
      <div aria-hidden className={cn("grid h-[7.5rem] place-items-center rounded-sm border border-dashed border-border-strong", className)}>
        <span className="font-label text-[0.72rem] font-bold tracking-[0.08em] text-faint-foreground">No games yet</span>
      </div>
    );
  }
  return (
    <div aria-hidden className={cn("relative h-[7.5rem]", className)}>
      {shown.map((game, i) => (
        <div
          key={game.game_id}
          className={cn("absolute bottom-0 origin-bottom", fan ? "w-[4.4rem]" : "w-[4.75rem]", " motion-safe:transition-transform motion-safe:duration-300")}
          style={
            fan
              ? { left: `calc(50% - 2.2rem + ${(i - 2) * 1.45}rem)`, transform: `rotate(${FAN_TILT[i]}deg)`, zIndex: i }
              : { left: `${i * 2}rem`, bottom: DECK_LIFT[i], transform: `rotate(${DECK_TILT[i]}deg)`, zIndex: i }
          }
        >
          <GameCover
            title={game.title}
            coverUrl={game.cover_url}
            className="w-full shadow-[0_8px_16px_rgb(0_0_0/0.5)]"
            fallbackClassName="p-1 text-[0.62rem]"
          />
        </div>
      ))}
    </div>
  );
}
