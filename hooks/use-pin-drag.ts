"use client";

import { useState, useSyncExternalStore } from "react";
import { placePin } from "@/lib/pinned-pages";

const PIN_DRAG_TYPE = "application/x-pinned-page";

export type DropEdge = "before" | "after";

// What a Pinned row needs while the list is dragged: the handlers for its
// item, whether it is the row being dragged, and the edge its drop line
// shows on (null: none).
export interface PinDragRow {
  handlers: React.HTMLAttributes<HTMLElement> & { draggable: boolean };
  dragging: boolean;
  edge: DropEdge | null;
}

const NO_HOVER = "(hover: none)";

function noHover(): boolean {
  return window.matchMedia(NO_HOVER).matches;
}

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(NO_HOVER);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

// Dragging the Pinned list into a new order with a mouse (spec api#416,
// www#137), with the browser's own drag and drop. A row dropped on the top
// half of another goes before it, on the bottom half after it. Touch
// devices reorder from the long-press menu instead, so a drag doesn't
// start there. `place` saves the new order.
export function usePinDrag(
  keys: readonly string[],
  place: (key: string, before: string | null) => void,
) {
  // Server and hydration render no drag; hover-less devices never get one.
  const canDrag = useSyncExternalStore(subscribe, () => !noHover(), () => false);
  const [dragged, setDragged] = useState<string | null>(null);
  const [target, setTarget] = useState<{ key: string; edge: DropEdge } | null>(null);

  // The page a drop on `key`'s `edge` would go before.
  const beforeOf = (key: string, edge: DropEdge) =>
    edge === "before" ? key : (keys[keys.indexOf(key) + 1] ?? null);

  const end = () => {
    setDragged(null);
    setTarget(null);
  };

  function row(key: string): PinDragRow {
    const edge =
      dragged && target?.key === key && placePin(keys, dragged, beforeOf(key, target.edge))
        ? target.edge
        : null;
    return {
      dragging: dragged === key,
      edge,
      handlers: {
        draggable: canDrag,
        onDragStart(e) {
          if (noHover()) return e.preventDefault();
          e.dataTransfer.setData(PIN_DRAG_TYPE, key);
          e.dataTransfer.effectAllowed = "move";
          setDragged(key);
        },
        onDragOver(e) {
          if (!dragged || !e.dataTransfer.types.includes(PIN_DRAG_TYPE)) return;
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
          const box = e.currentTarget.getBoundingClientRect();
          const at: DropEdge = e.clientY < box.top + box.height / 2 ? "before" : "after";
          if (target?.key !== key || target.edge !== at) setTarget({ key, edge: at });
        },
        onDragLeave(e) {
          if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
          setTarget((t) => (t?.key === key ? null : t));
        },
        onDrop(e) {
          if (!dragged || !e.dataTransfer.types.includes(PIN_DRAG_TYPE)) return;
          e.preventDefault();
          const box = e.currentTarget.getBoundingClientRect();
          const at: DropEdge = e.clientY < box.top + box.height / 2 ? "before" : "after";
          place(dragged, beforeOf(key, at));
          end();
        },
        onDragEnd: end,
      },
    };
  }

  return row;
}
