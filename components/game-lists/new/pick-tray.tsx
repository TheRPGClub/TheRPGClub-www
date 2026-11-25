"use client";

import { Check } from "lucide-react";
import type { GameListGame } from "@/lib/game-lists/types";
import { Button } from "@/components/ui/button";
import { TrayCovers } from "@/components/game-lists/new/tray-covers";

// The tray along the foot of /lists/new (pick 3C): how many games are
// picked in yellow Anton, their covers in the order they'll go in (a Ranked
// list's drag into a new order; each has a cross to put it back), and
// Create, which carries them in.
export function PickTray({
  picked,
  pending,
  error,
  blocked,
  sortable,
  onReorder,
  onUnpick,
  onCreate,
}: {
  picked: readonly GameListGame[];
  pending: boolean;
  error: string | null;
  // Why Create can't be pressed yet; null when it can.
  blocked: string | null;
  sortable: boolean;
  onReorder: (ids: number[]) => void;
  onUnpick: (game: GameListGame) => void;
  onCreate: () => void;
}) {
  const n = picked.length;
  return (
    <div className="sticky bottom-[calc(5rem+env(safe-area-inset-bottom))] z-20 grid gap-4 rounded-md bg-card px-4 py-4 shadow-[inset_0_2px_0_var(--color-highlight),0_-12px_30px_rgb(0_0_0/0.45)] sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:gap-5 sm:px-5 md:bottom-4">
      <p className="font-headline flex items-baseline gap-2 text-[3.2rem] leading-[0.8] text-highlight sm:block">
        {n}
        <small className="font-label block text-[0.72rem] font-bold tracking-[0.08em] text-dim-foreground sm:mt-1.5">
          picked
        </small>
      </p>
      <div className="min-w-0">
        {n === 0 ? (
          <p className="text-sm text-faint-foreground">Tap covers above to pick games, or create the list empty.</p>
        ) : (
          <TrayCovers picked={picked} sortable={sortable} onReorder={onReorder} onRemove={onUnpick} />
        )}
        {error && <p role="alert" className="mt-2 text-sm text-destructive">{error}</p>}
        {blocked && !error && <p id="create-blocked" className="mt-2 text-sm text-dim-foreground">{blocked}</p>}
      </div>
      <Button variant="highlight" onClick={onCreate} disabled={blocked !== null || pending} aria-describedby={blocked ? "create-blocked" : undefined}>
        <Check aria-hidden />
        {pending ? "Creating" : n === 0 ? "Create list" : `Create with ${n} ${n === 1 ? "game" : "games"}`}
      </Button>
    </div>
  );
}
