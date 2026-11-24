"use client";

import { useState, type DragEvent } from "react";

const COVER_DRAG_TYPE = "application/x-game-list-entry";

// Dragging a cover into a new place on a ranked Game List's wall by its
// grip, with the browser's own drag and drop (the dashboard's pattern,
// www#145). Dropped on the left half of another cover it goes before it, on
// the right half after it. Touch and keyboard use Move up and Move down.
export function useCoverDrag(ids: readonly number[], place: (id: number, before: number | null) => void) {
  const [dragged, setDragged] = useState<number | null>(null);
  const [over, setOver] = useState<{ id: number; before: number | null } | null>(null);

  const beforeAt = (id: number, e: DragEvent<HTMLElement>): number | null => {
    const box = e.currentTarget.getBoundingClientRect();
    if (e.clientX < box.left + box.width / 2) return id;
    return ids[ids.indexOf(id) + 1] ?? null;
  };
  const end = () => {
    setDragged(null);
    setOver(null);
  };

  return {
    dragged,
    // The cover the dragged one would land in front of (null: at the end),
    // while a drag is over the wall.
    landing: over && dragged !== null ? over.before : undefined,
    grip: (id: number) => ({
      draggable: true,
      onDragStart(e: DragEvent<HTMLElement>) {
        e.dataTransfer.setData(COVER_DRAG_TYPE, String(id));
        e.dataTransfer.effectAllowed = "move";
        const tile = e.currentTarget.closest("li");
        if (tile) e.dataTransfer.setDragImage(tile, 40, 40);
        setDragged(id);
      },
      onDragEnd: end,
    }),
    target: (id: number) => ({
      onDragOver(e: DragEvent<HTMLElement>) {
        if (dragged === null || !e.dataTransfer.types.includes(COVER_DRAG_TYPE)) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        const before = beforeAt(id, e);
        if (over?.id !== id || over.before !== before) setOver({ id, before });
      },
      onDrop(e: DragEvent<HTMLElement>) {
        if (dragged === null || !e.dataTransfer.types.includes(COVER_DRAG_TYPE)) return;
        e.preventDefault();
        place(dragged, beforeAt(id, e));
        end();
      },
    }),
  };
}
