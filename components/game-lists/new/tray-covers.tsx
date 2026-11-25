"use client";

import { X } from "lucide-react";
import type { GameListGame } from "@/lib/game-lists/types";
import { useSortable } from "@/hooks/use-sortable";
import { Button } from "@/components/ui/button";
import { GameCover } from "@/components/issue/game-cover";
import { SortStatus } from "@/components/sortable/sort-status";

// The picked covers in the tray on /lists/new, in the order they'll go in.
// A Ranked list's covers drag into a new order (Make Room); each cover's
// small cross puts the game back.
export function TrayCovers({
  picked,
  sortable,
  onReorder,
  onRemove,
}: {
  picked: readonly GameListGame[];
  // Only a Ranked list's order means anything.
  sortable: boolean;
  onReorder: (ids: number[]) => void;
  onRemove: (game: GameListGame) => void;
}) {
  const byId = new Map(picked.map((g) => [g.game_id, g]));
  const sort = useSortable({
    zones: { tray: picked.map((g) => g.game_id) },
    layout: "grid",
    disabled: !sortable,
    onDrop: (next) => onReorder(next.tray),
    name: (id) => byId.get(id)?.title ?? "Game",
  });
  return (
    <>
      <ul {...sort.zone("tray")} className="flex gap-2 overflow-x-auto p-1" aria-label="Picked games">
        {sort.zones.tray.map((id) => {
          const game = byId.get(id);
          if (!game) return null;
          return (
            <li key={id} {...sort.item(id)} aria-label={sortable ? game.title : undefined} className="relative shrink-0">
              <GameCover title={game.title} coverUrl={game.cover_url} className="w-12" fallbackClassName="p-0.5 text-[0.55rem]" />
              <Button
                variant="cover-remove"
                size="icon-xs"
                aria-label={`Unpick ${game.title}`}
                onClick={() => onRemove(game)}
                className="absolute top-0.5 right-0.5 size-5"
              >
                <X />
              </Button>
            </li>
          );
        })}
      </ul>
      {sortable && <SortStatus status={sort.status} />}
    </>
  );
}
