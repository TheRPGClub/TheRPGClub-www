"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { Plus, Shuffle } from "lucide-react";
import { ADD_FUN_FACT_ID } from "@/lib/codex/paths";
import { Button } from "@/components/ui/button";

// What the wall's controls share on this visit: a shuffled deal of the page
// (order and tilts, from "Shuffle the wall") and the Fun Fact this member
// just added, which goes out next as the Daily Fun Fact. Neither is saved,
// and neither touches the Daily Fun Fact's queue.
interface WallState {
  deal: { order: number[]; tilts: Record<number, number> } | null;
  shuffle: (ids: number[]) => void;
  nextDaily: number | null;
  setNextDaily: (id: number) => void;
}

const WallContext = createContext<WallState>({ deal: null, shuffle: () => {}, nextDaily: null, setNextDaily: () => {} });

export function useWall(): WallState {
  return useContext(WallContext);
}

export function WallProvider({ ids, children }: { ids: number[]; children: ReactNode }) {
  const [deal, setDeal] = useState<WallState["deal"]>(null);
  const [nextDaily, setNextDaily] = useState<number | null>(null);
  const key = ids.join(",");
  const [dealtFor, setDealtFor] = useState(key);
  // A new page (or a card added or deleted) is dealt as it comes.
  if (dealtFor !== key) {
    setDealtFor(key);
    setDeal(null);
  }

  function shuffle(list: number[]) {
    const order = [...list];
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    const tilts = Object.fromEntries(list.map((id) => [id, Math.round((Math.random() * 4.4 - 2.2) * 10) / 10]));
    setDeal({ order, tilts });
  }

  return <WallContext.Provider value={{ deal, shuffle, nextDaily, setNextDaily }}>{children}</WallContext.Provider>;
}

// The header's two actions: re-deal this page, and go to the add panel.
export function WallActions({ ids, canAdd }: { ids: number[]; canAdd: boolean }) {
  const { shuffle } = useWall();
  return (
    <>
      {ids.length > 1 && (
        <Button variant="outline" onClick={() => shuffle(ids)}>
          <Shuffle aria-hidden />
          Shuffle the wall
        </Button>
      )}
      {canAdd && (
        <Button
          variant="highlight"
          className="w-full sm:w-auto"
          onClick={() => {
            const panel = document.getElementById(ADD_FUN_FACT_ID);
            panel?.scrollIntoView({ behavior: "smooth", block: "center" });
            panel?.querySelector("textarea")?.focus({ preventScroll: true });
          }}
        >
          <Plus aria-hidden />
          Add a Fun Fact
        </Button>
      )}
    </>
  );
}
