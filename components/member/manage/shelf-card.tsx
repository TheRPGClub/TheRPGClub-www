"use client";

import type { ReactNode } from "react";
import type { ShelfOrder } from "@/hooks/use-shelf-order";
import { cn } from "@/lib/utils";

// One entry's card on its owner's list page (spec api#451, pick 3A). On an
// ordered list it can be dragged over another to take its place; picked up
// (by drag or by its Move token) it lifts, tilts and takes the yellow ring
// while the rest dim.
export function ShelfCard({
  id,
  order,
  ordered,
  children,
}: {
  id: number;
  order: ShelfOrder;
  ordered: boolean;
  children: ReactNode;
}) {
  const lifted = order.lifted === id;
  const drag = ordered && !order.pending;
  return (
    <li
      draggable={drag}
      onDragStart={drag ? (e) => { e.dataTransfer.effectAllowed = "move"; order.pickUp(id); } : undefined}
      onDragOver={drag ? (e) => { e.preventDefault(); order.over(id); } : undefined}
      onDrop={drag ? (e) => { e.preventDefault(); order.put(); } : undefined}
      onDragEnd={drag ? () => order.cancel() : undefined}
      className={cn(
        "relative rounded-sm motion-safe:transition-transform motion-safe:duration-200",
        lifted && "z-10 outline-3 outline-offset-4 outline-highlight motion-safe:-translate-y-2.5 motion-safe:-rotate-[1.5deg]",
        order.lifted !== null && !lifted && "opacity-70",
      )}
    >
      {children}
    </li>
  );
}
