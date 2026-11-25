"use client";

import { useState, type ReactNode } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FranchiseSearchPanel } from "@/components/games/edit/franchise-lanes/franchise-search-panel";
import { ParentGameSearch } from "@/components/games/edit/franchise-lanes/parent-game-search";

type Pick = { franchise_id: number; name: string } | { name: string };
type Parent = { game_id: number; name: string };
// What `extra` gets: the slot's search text, and the slot's add (a parent
// given skips asking for one).
export type SlotExtra = (slot: { query: string; add: (franchise: Pick, parent?: Parent) => void }) => ReactNode;

// A lane's + Add slot (design pick edit-lanes): a dashed "Add" that opens a
// search to link or create a Franchise in the lane's role. In Add-on of, a
// game with no parent then asks for it ("Pick the Franchise, then its parent
// game"). `extra` shows under the search field (the lane's suggestions,
// www#209), and `omit` keeps what it lists out of the results. `hint` sits
// in the closed Add ("1 suggested").
export function LaneAddSlot({
  gameId,
  laneTitle,
  roleLabel,
  open,
  onOpen,
  onClose,
  needsParent,
  picked,
  staged,
  onAdd,
  extra,
  omit,
  hint,
}: {
  gameId: number;
  laneTitle: string;
  roleLabel: string;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  needsParent: boolean;
  picked: (franchiseId: number) => boolean;
  staged: (name: string) => boolean;
  onAdd: (franchise: Pick, parent?: Parent) => void;
  extra?: SlotExtra;
  omit?: (franchiseId: number) => boolean;
  hint?: string;
}) {
  const [pending, setPending] = useState<Pick | null>(null);
  const close = () => {
    setPending(null);
    onClose();
  };
  const add = (franchise: Pick, parent?: Parent) => {
    if (needsParent && !parent) return setPending(franchise);
    onAdd(franchise, needsParent ? parent : undefined);
    close();
  };

  if (!open) {
    return (
      <Button type="button" variant="add" className="h-12 px-4" aria-label={`Add a Franchise to ${laneTitle}${hint ? `, ${hint}` : ""}`} onClick={onOpen}>
        <Plus data-icon="inline-start" />
        Add
        {hint && <span className="text-highlight">· {hint}</span>}
      </Button>
    );
  }
  return (
    <SlotPanel label={`Add a Franchise to ${laneTitle}`}>
      {pending ? (
        <ParentGameSearch
          gameId={gameId}
          question={`${pending.name}: which game is this an Add-on of?`}
          onPick={(parent) => {
            onAdd(pending, parent);
            close();
          }}
          onClose={close}
        />
      ) : (
        <FranchiseSearchPanel
          laneTitle={laneTitle}
          roleLabel={roleLabel}
          picked={picked}
          staged={staged}
          onPick={(f) => add({ franchise_id: f.franchise_id, name: f.name })}
          onCreate={(name) => add({ name })}
          onClose={close}
          between={extra && ((query) => extra({ query, add }))}
          omit={omit}
        />
      )}
      <div className="flex justify-end border-t border-border px-2 py-1.5">
        <Button type="button" variant="ghost" size="xs" onClick={close}>
          Cancel
        </Button>
      </div>
    </SlotPanel>
  );
}

// An open slot: on its own line under the lane's Franchises, yellow-ringed
// like a focused field.
export function SlotPanel({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="basis-full">
      <div role="group" aria-label={label} className="overflow-hidden rounded-sm border border-highlight bg-background ring-3 ring-highlight/18 sm:max-w-160">
        {children}
      </div>
    </div>
  );
}
