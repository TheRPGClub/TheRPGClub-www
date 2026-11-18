"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { RunMatrix } from "@/lib/challenges/slots";
import { MoveDialog, type ShownGame } from "@/components/challenges/slots/move-dialog";
import { PastPickDialog } from "@/components/challenges/slots/past-pick-dialog";

// What a Run panel's tiles and buttons can open: the Move menu (for one game,
// or to choose the game first) and the past-play picker (for one open year,
// or any). `own` is the viewer's own Active Run; `pastPlay` is Counts past
// play. Other Runs are read-only: a tile then opens the game, not the menu.

interface SlotActions {
  own: boolean;
  pastPlay: boolean;
  openGame: (game: ShownGame) => void;
  openMove: () => void;
  openPick: (year: number | null) => void;
}

const SlotActionsContext = createContext<SlotActions>({
  own: false,
  pastPlay: false,
  openGame: () => {},
  openMove: () => {},
  openPick: () => {},
});

export function useSlotActions() {
  return useContext(SlotActionsContext);
}

export function SlotActionsProvider({
  runId,
  matrix,
  own,
  pastPlay,
  owner,
  children,
}: {
  runId: number;
  matrix: RunMatrix;
  own: boolean;
  pastPlay: boolean;
  // Whose Run it is, for the read-only game view ("picked by them").
  owner: string;
  children: React.ReactNode;
}) {
  // The move dialog: closed, choosing a game, or one game's years.
  const [move, setMove] = useState<{ game: ShownGame | null } | null>(null);
  const [pick, setPick] = useState<{ year: number | null } | null>(null);
  const value = useMemo<SlotActions>(
    () => ({
      own,
      pastPlay: own && pastPlay,
      openGame: (game) => setMove({ game }),
      openMove: () => setMove({ game: null }),
      openPick: (year) => setPick({ year }),
    }),
    [own, pastPlay],
  );
  return (
    <SlotActionsContext.Provider value={value}>
      {children}
      <MoveDialog runId={runId} state={move} games={matrix.movable} canMove={own} owner={owner} onState={setMove} />
      {own && pastPlay && (
        <PastPickDialog runId={runId} year={pick?.year ?? null} open={pick !== null} onClose={() => setPick(null)} />
      )}
    </SlotActionsContext.Provider>
  );
}
