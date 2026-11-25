"use client";

import { useState } from "react";
import {
  FRANCHISE_ZONE_NAMES,
  canDropInZone,
  franchiseBoardView,
  franchiseGamesById,
  franchiseZones,
  planFranchiseMove,
  settleZones,
  type FranchiseZone,
  type FranchiseZones,
} from "@/lib/franchises/board";
import type { FranchiseLayout } from "@/lib/franchises/page";
import type { FranchiseEditor } from "@/hooks/use-franchise-editor";
import { useSortable } from "@/hooks/use-sortable";

// The Franchise editor's drag board (Make Room, fixed order): a cover drags
// between Mainline, Spin-offs and Add-ons. A drop shows at once, settled into
// release order, and saves behind; a failed save puts it back. A drop into
// Add-ons first asks which game it's an Add-on of (cancelling puts it back).
export function useFranchiseBoard(layout: FranchiseLayout, editor: FranchiseEditor) {
  const base = franchiseZones(layout);
  // A drop held until the page reads itself again (its zones change).
  const key = JSON.stringify(base);
  const [held, setHeld] = useState<{ key: string; zones: FranchiseZones } | null>(null);
  const [picking, setPicking] = useState<number | null>(null);
  const saved = held && held.key === key ? held.zones : base;
  const savedView = franchiseBoardView(layout, saved);
  const games = franchiseGamesById(layout);

  const ask = (id: number) => {
    editor.dismissError();
    setPicking(id);
  };

  const s = useSortable<FranchiseZone, number>({
    zones: saved,
    layout: "grid",
    fixedOrder: true,
    disabled: !editor.editing || editor.pending,
    canDrop: (id, to) => canDropInZone(savedView, id, to),
    name: (id) => games.get(id)?.title ?? "This game",
    zoneName: (z) => FRANCHISE_ZONE_NAMES[z],
    onDrop: (next, move) => {
      const plan = planFranchiseMove(move.from, move.to);
      if (plan.kind === "none") return;
      setHeld({ key, zones: settleZones(layout, next) });
      if (plan.kind === "pick-parent") return ask(move.id);
      editor.place(move.id, plan.data, (ok) => !ok && setHeld(null));
    },
  });

  return {
    ...s,
    view: franchiseBoardView(layout, s.zones),
    // The game whose parent is being picked, and the games offered first.
    picking: picking === null ? null : (games.get(picking) ?? null),
    picks: [...savedView.mainline, ...savedView.other].filter((g) => g.game_id !== picking),
    // An Add-on's "another game" control: the same question, no drag.
    reparent: ask,
    pickParent: (parentId: number) => {
      if (picking === null) return;
      editor.place(picking, { parent_game_id: parentId }, (ok) => ok && setPicking(null));
    },
    cancelPick: () => {
      setPicking(null);
      setHeld(null);
      editor.dismissError();
    },
  };
}

export type FranchiseBoard = ReturnType<typeof useFranchiseBoard>;
export type FranchiseItemProps = ReturnType<FranchiseBoard["item"]>;
