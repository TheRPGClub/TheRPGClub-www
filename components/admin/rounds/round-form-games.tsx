import { ArrowDown, ArrowUp, X } from "lucide-react";
import type { Game } from "@/lib/api/types";
import { moveItem } from "@/lib/rounds";
import { GamePicker } from "@/components/member/game-picker";
import { GameCover } from "@/components/issue/game-cover";
import { Button } from "@/components/ui/button";
import { fieldLabel } from "./styles";

// The new round's games in slot order, each with its move and remove tools,
// and the search that adds the next one.
export function RoundFormGames({
  id,
  games,
  setGames,
  onPick,
  pickerKey,
  locked,
}: {
  id: string;
  games: Game[];
  setGames: (update: (list: Game[]) => Game[]) => void;
  onPick: (game: Game) => void;
  pickerKey: number;
  locked: boolean;
}) {
  return (
    <div className="space-y-2">
      <span id={`${id}-games`} className={fieldLabel}>
        Games, in slot order
      </span>
      {games.length > 0 && (
        <ol aria-labelledby={`${id}-games`} className="border-t border-border">
          {games.map((game, i) => (
            <li
              key={game.game_id}
              className="grid grid-cols-[1.5rem_2.25rem_minmax(0,1fr)_auto] items-center gap-3 border-b border-border py-2"
            >
              <span className="font-headline text-center text-[1.2rem] text-faint-foreground">{i + 1}</span>
              <GameCover title={game.title} coverUrl={game.cover_url} className="w-9 rounded-xs" fallbackClassName="p-0.5 text-[0.45rem]" />
              <span className="min-w-0 truncate font-semibold">{game.title}</span>
              {!locked && (
                <span className="flex gap-0.5">
                  <Button
                    type="button"
                    variant="row"
                    size="icon-sm"
                    disabled={i === 0}
                    onClick={() => setGames((list) => moveItem(list, i, i - 1))}
                    aria-label={`Move ${game.title} up`}
                  >
                    <ArrowUp />
                  </Button>
                  <Button
                    type="button"
                    variant="row"
                    size="icon-sm"
                    disabled={i === games.length - 1}
                    onClick={() => setGames((list) => moveItem(list, i, i + 1))}
                    aria-label={`Move ${game.title} down`}
                  >
                    <ArrowDown />
                  </Button>
                  <Button
                    type="button"
                    variant="destructive-row"
                    size="icon-sm"
                    onClick={() => setGames((list) => list.filter((g) => g.game_id !== game.game_id))}
                    aria-label={`Remove ${game.title}`}
                  >
                    <X />
                  </Button>
                </span>
              )}
            </li>
          ))}
        </ol>
      )}
      {!locked && (
        <GamePicker
          key={pickerKey}
          compact
          onPick={onPick}
          placeholder={games.length === 0 ? "Search for the round's game…" : "Search for another game…"}
        />
      )}
    </div>
  );
}
