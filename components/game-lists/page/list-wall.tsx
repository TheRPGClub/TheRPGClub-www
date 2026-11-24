"use client";

import type { GameListBoard } from "@/hooks/use-game-list-board";
import { useCoverDrag } from "@/hooks/use-cover-drag";
import { AddGameTile } from "@/components/game-lists/page/add-game-dialog";
import { WallTile } from "@/components/game-lists/page/wall-tile";

// The list's games as a numbered wall of big covers (pick 2D), five across
// on a desktop and two on a phone, in the list's own order. While editing,
// a ranked list's covers drag by their grip and each cover has its control
// strip; the dashed Add a game tile ends the wall.
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
  const ranked = list.sort === "ranked";
  const ids = entries.map((e) => e.game_id);
  const drag = useCoverDrag(ids, board.place);

  if (entries.length === 0 && !editing) {
    return (
      <p className="rounded-md border border-dashed border-border-strong px-4 py-10 text-center text-sm text-faint-foreground">
        No games on this list yet.
      </p>
    );
  }
  return (
    <ol className="grid grid-cols-2 gap-x-3.5 gap-y-7 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4 xl:grid-cols-5">
      {entries.map((entry, i) => (
        <li key={entry.game_id} {...(editing && ranked ? drag.target(entry.game_id) : {})}>
          <WallTile
            entry={entry}
            place={i + 1}
            sort={list.sort}
            now={now}
            dragging={drag.dragged === entry.game_id}
            landing={drag.landing === entry.game_id}
            edit={
              editing
                ? {
                    first: i === 0,
                    last: i === entries.length - 1,
                    onMove: (step) => board.move(entry.game_id, step),
                    onNote: () => onNote(entry.game_id),
                    onRemove: () => board.remove(entry.game_id),
                    grip: drag.grip(entry.game_id),
                  }
                : null
            }
          />
        </li>
      ))}
      {editing && (
        <li className="relative">
          {drag.landing === null && <span aria-hidden className="absolute top-0 -left-2.5 h-full w-0.75 rounded-full bg-highlight sm:-left-3" />}
          <AddGameTile listName={list.name} onAdd={board.add} />
        </li>
      )}
    </ol>
  );
}
