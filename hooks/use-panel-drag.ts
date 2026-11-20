"use client";

import { useState, type DragEvent } from "react";
import type { PanelKey } from "@/lib/dashboard/panels";
import { placePanel } from "@/lib/dashboard/panel-edit";

const PANEL_DRAG_TYPE = "application/x-dashboard-panel";

export type PanelDropEdge = "before" | "after";

// Dragging a Dashboard Panel into a new place by its grip, with the browser's
// own drag and drop (www#145). The whole panel is the drag image and every
// panel is a drop target: dropped on the top half of another it goes before
// it, on the bottom half after it, in the member's one order (each panel
// still lands in its own column). Touch and keyboard move with the arrows.
export function usePanelDrag(keys: readonly PanelKey[], place: (key: PanelKey, next: PanelKey[]) => void) {
  const [dragged, setDragged] = useState<PanelKey | null>(null);
  const [target, setTarget] = useState<{ key: PanelKey; edge: PanelDropEdge } | null>(null);

  const beforeOf = (key: PanelKey, edge: PanelDropEdge) =>
    edge === "before" ? key : (keys[keys.indexOf(key) + 1] ?? null);
  const edgeAt = (e: DragEvent<HTMLElement>): PanelDropEdge => {
    const box = e.currentTarget.getBoundingClientRect();
    return e.clientY < box.top + box.height / 2 ? "before" : "after";
  };
  const end = () => {
    setDragged(null);
    setTarget(null);
  };

  // The grip's handlers.
  function grip(key: PanelKey) {
    return {
      onGripDragStart(e: DragEvent<HTMLElement>) {
        e.dataTransfer.setData(PANEL_DRAG_TYPE, key);
        e.dataTransfer.effectAllowed = "move";
        const panel = e.currentTarget.closest("section");
        if (panel) e.dataTransfer.setDragImage(panel, 24, 24);
        setDragged(key);
      },
      onGripDragEnd: end,
    };
  }

  // A panel's drop handlers, the edge its drop line shows on (null: none)
  // and the 1-based place the dragged panel would take there.
  function target_(key: PanelKey) {
    const next = dragged && target?.key === key ? placePanel(keys, dragged, beforeOf(key, target.edge)) : null;
    return {
      edge: next && target ? target.edge : null,
      place: next && dragged ? next.indexOf(dragged) + 1 : 0,
      handlers: {
        onDragOver(e: DragEvent<HTMLElement>) {
          if (!dragged || !e.dataTransfer.types.includes(PANEL_DRAG_TYPE)) return;
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
          const at = edgeAt(e);
          if (target?.key !== key || target.edge !== at) setTarget({ key, edge: at });
        },
        onDragLeave(e: DragEvent<HTMLElement>) {
          if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
          setTarget((t) => (t?.key === key ? null : t));
        },
        onDrop(e: DragEvent<HTMLElement>) {
          if (!dragged || !e.dataTransfer.types.includes(PANEL_DRAG_TYPE)) return;
          e.preventDefault();
          // The edge the drop line shows is where it lands.
          const at = target?.key === key ? target.edge : edgeAt(e);
          const next = placePanel(keys, dragged, beforeOf(key, at));
          if (next) place(dragged, next);
          end();
        },
      },
    };
  }

  return { dragged, grip, target: target_ };
}
