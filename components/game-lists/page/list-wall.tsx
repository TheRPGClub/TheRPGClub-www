"use client";

import type { GameListBoard } from "@/hooks/use-game-list-board";
import { useSortable } from "@/hooks/use-sortable";
import { AddGameTile } from "@/components/game-lists/page/add-game-dialog";
import { WallTile } from "@/components/game-lists/page/wall-tile";
import { SortStatus } from "@/components/sortable/sort-status";

// The list's games as a numbered wall of big covers (pick 2D), five across
// on a desktop and two on a phone, in the list's own order. While editing,
// a ranked list's covers drag into a new place (Make Room) and each cover
// has its control strip; the dashed Add a game tile ends the wall.
export function ListWall({
  board,
  editing,
  now,
  onNote,
}: {
  board: GameListBoard;
  editing: boolean;
  now: Date;
  onNote: (gameId: number) => void;
}) {
  const { list, entries } = board;
  const byId = new Map(entries.map((e) => [e.game_id, e]));
  const sort = useSortable({
    zones: { wall: entries.map((e) => e.game_id) },
    layout: "grid",
    disabled: !editing || list.sort !== "ranked",
    onDrop: (next) => board.reorder(next.wall),
    name: (id) => byId.get(id)?.game.title ?? "Game",
  });

  if (entries.length === 0 && !editing) {
    return (
      <p data-slot="shelf-empty" className="rounded-md border border-dashed border-border-strong px-4 py-10 text-center text-sm text-faint-foreground">
        No games on this list yet.
      </p>
    );
  }
  return (
    <>
      <ol {...sort.zone("wall")} className="grid grid-cols-2 gap-x-3.5 gap-y-7 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4 xl:grid-cols-5">
        {sort.zones.wall.map((id, i) => {
          const entry = byId.get(id);
          if (!entry) return null;
          return (
            <li key={id} {...sort.item(id)}>
              <WallTile
                entry={entry}
                place={i + 1}
                sort={list.sort}
                now={now}
                edit={editing ? { onNote: () => onNote(id), onRemove: () => board.remove(id) } : null}
              />
            </li>
          );
        })}
        {editing && (
          <li>
            <AddGameTile listName={list.name} onAdd={board.add} />
          </li>
        )}
      </ol>
      <SortStatus status={sort.status} />
    </>
  );
}
