"use client";

import { useState } from "react";
import type { DraftGame } from "@/lib/challenges/form";
import type { EditorGame, PoolSide } from "@/lib/challenges/pool-editor";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { POOL_GAME_TYPE, PoolTile } from "@/components/challenges/form/pool-tile";

const PAGE = 40;

// One section of the Pool editor (pick 8: Core on top, Optional below): its
// heading on the rule (Core's rule in the Challenge tint's hi), what sits
// under the heading, then its covers. The whole section takes a cover
// dragged from the other one, and lights its dashed edge while one is over
// it.
export function PoolSection({
  side,
  title,
  count,
  aside,
  children,
  games,
  empty,
  onMove,
  onLeaveOut,
}: {
  side: PoolSide;
  title: string;
  count: string;
  aside?: React.ReactNode;
  children?: React.ReactNode;
  games: EditorGame[];
  empty: string;
  onMove: (game: DraftGame, to: PoolSide) => void;
  onLeaveOut: (game: DraftGame) => void;
}) {
  const [over, setOver] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? games : games.slice(0, PAGE);
  const id = `pool-${side}-heading`;
  const takes = (event: React.DragEvent) => event.dataTransfer.types.includes(POOL_GAME_TYPE);
  return (
    <section
      aria-labelledby={id}
      onDragOver={(event) => {
        if (!takes(event)) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        setOver(true);
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOver(false);
      }}
      onDrop={(event) => {
        setOver(false);
        const raw = event.dataTransfer.getData(POOL_GAME_TYPE);
        if (!raw) return;
        event.preventDefault();
        const game = JSON.parse(raw) as DraftGame & { from: PoolSide };
        if (game.from !== side) onMove(game, side);
      }}
      className={cn(
        "-mx-3 rounded-md px-3 pb-4 transition-shadow",
        over && "bg-muted/40 shadow-[inset_0_0_0_2px_var(--color-highlight)]",
      )}
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
      {games.length === 0 ? (
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
              onMove={(to) => onMove(game, to)}
              onLeaveOut={() => onLeaveOut(game)}
            />
          ))}
        </ul>
      )}
      {!showAll && games.length > PAGE && (
        <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => setShowAll(true)}>
          Show all {games.length}
        </Button>
      )}
    </section>
  );
}
