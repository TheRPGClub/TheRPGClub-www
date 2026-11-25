"use client";

import { useState } from "react";
import type { useSortable } from "@/hooks/use-sortable";
import type { DraftGame } from "@/lib/challenges/form";
import type { EditorGame, PoolSide } from "@/lib/challenges/pool-editor";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PoolTile } from "@/components/challenges/form/pool-tile";

const PAGE = 40;

// One section of the Pool editor (pick 8: Core on top, Optional below): its
// heading on the rule (Core's rule in the Challenge tint's hi), what sits
// under the heading, then its covers. The whole section is a drop zone for
// a cover dragged from the other one (useSortable rings it).
export function PoolSection({
  side,
  title,
  count,
  aside,
  children,
  empty,
  sort,
  lookup,
  onMove,
  onLeaveOut,
}: {
  side: PoolSide;
  title: string;
  count: string;
  aside?: React.ReactNode;
  children?: React.ReactNode;
  empty: string;
  sort: ReturnType<typeof useSortable<PoolSide, number>>;
  // Every game in the Pool editor, for a cover dragged in from the other side.
  lookup: Map<number, EditorGame>;
  onMove: (game: DraftGame, to: PoolSide) => void;
  onLeaveOut: (game: DraftGame) => void;
}) {
  const [showAll, setShowAll] = useState(false);
  // The live order: a cover dragged in from the other section shows here.
  const live = sort.zones[side].flatMap((id) => lookup.get(id) ?? []);
  const visible = showAll ? live : live.slice(0, PAGE);
  const id = `pool-${side}-heading`;
  return (
    <section
      aria-labelledby={id}
      {...sort.zone(side)}
      className="-mx-3 rounded-md px-3 pb-4"
    >
      <div
        className={cn(
          "flex flex-wrap items-center gap-x-3 gap-y-2 border-b-2 pt-3 pb-2",
          side === "core" ? "border-(--challenge-tint-hi)" : "border-foreground",
        )}
      >
        <h3 id={id} className="font-headline text-[1.75rem] leading-none">
          {title}
        </h3>
        <span className="font-label text-sm tracking-[0.08em] text-faint-foreground">{count}</span>
        {aside && <div className="ml-auto">{aside}</div>}
      </div>
      {children}
      {live.length === 0 ? (
        <p className="mt-3.5 rounded-md border border-dashed border-border-strong px-4 py-3.5 text-faint-foreground">
          {empty}
        </p>
      ) : (
        <ul className="mt-3.5 grid grid-cols-3 gap-x-3 gap-y-4 sm:grid-cols-5 lg:grid-cols-8 2xl:grid-cols-10">
          {visible.map((game) => (
            <PoolTile
              key={game.game_id}
              game={game}
              side={side}
              item={sort.item(game.game_id)}
              onMove={(to) => onMove(game, to)}
              onLeaveOut={() => onLeaveOut(game)}
            />
          ))}
        </ul>
      )}
      {!showAll && live.length > PAGE && (
        <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => setShowAll(true)}>
          Show all {live.length}
        </Button>
      )}
    </section>
  );
}
