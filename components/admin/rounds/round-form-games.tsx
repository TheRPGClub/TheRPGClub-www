"use client";

import { X } from "lucide-react";
import type { Game } from "@/lib/api/types";
import { useSortable } from "@/hooks/use-sortable";
import { GamePicker } from "@/components/member/game-picker";
import { GameCover } from "@/components/issue/game-cover";
import { SortGrip } from "@/components/sortable/sort-grip";
import { SortStatus } from "@/components/sortable/sort-status";
import { Button } from "@/components/ui/button";
import { fieldLabel } from "./styles";

// The new round's games in slot order (drag a row to reorder it), each with
// its remove tool, and the search that adds the next one.
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
  const byId = new Map(games.map((g) => [g.game_id, g]));
  const s = useSortable({
    zones: { games: games.map((g) => g.game_id) },
    layout: "rows",
    disabled: locked,
    name: (gameId) => byId.get(gameId)?.title ?? "Game",
    onDrop: (next) =>
      setGames((list) => {
        const now = new Map(list.map((g) => [g.game_id, g]));
        return next.games.map((gameId) => now.get(gameId)).filter((g): g is Game => !!g);
      }),
  });

  return (
    <div className="space-y-2">
      <span id={`${id}-games`} className={fieldLabel}>
        Games, in slot order
      </span>
      {games.length > 0 && (
        <ol aria-labelledby={`${id}-games`} className="border-t border-border" {...s.zone("games")}>
          {s.zones.games.map((gameId, i) => {
            const game = byId.get(gameId);
            if (!game) return null;
            return (
              <li
                key={gameId}
                {...s.item(gameId)}
                className="grid grid-cols-[1rem_1.5rem_2.25rem_minmax(0,1fr)_auto] items-center gap-3 border-b border-border py-2"
              >
                {locked ? <span /> : <SortGrip />}
                <span className="font-headline text-center text-[1.2rem] text-faint-foreground">{i + 1}</span>
                <GameCover title={game.title} coverUrl={game.cover_url} className="w-9 rounded-xs" fallbackClassName="p-0.5 text-[0.45rem]" />
                <span className="min-w-0 truncate font-semibold">{game.title}</span>
                {!locked && (
                  <Button
                    type="button"
                    variant="destructive-row"
                    size="icon-sm"
                    onClick={() => setGames((list) => list.filter((g) => g.game_id !== game.game_id))}
                    aria-label={`Remove ${game.title}`}
                  >
                    <X />
                  </Button>
                )}
              </li>
            );
          })}
        </ol>
      )}
      {!locked && <SortStatus status={s.status} />}
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
