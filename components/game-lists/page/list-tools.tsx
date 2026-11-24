"use client";

import { Check, Trash2 } from "lucide-react";
import { GAME_LIST_SORTS, SORT_LABEL, type GameListSort } from "@/lib/game-lists/types";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { FeatureSwitch } from "@/components/feature/feature-switch";

// The editing bar over a list's wall (pick 2D), ringed in the yellow of the
// member's own edits: the order, Private (the owner's alone to change), and
// at its right Delete list and Done.
export function ListTools({
  sort,
  isPrivate,
  canChangeVisibility,
  canDelete,
  pending,
  onSort,
  onPrivate,
  onDelete,
  onDone,
}: {
  sort: GameListSort;
  isPrivate: boolean;
  canChangeVisibility: boolean;
  canDelete: boolean;
  pending: boolean;
  onSort: (sort: GameListSort) => void;
  onPrivate: (on: boolean) => void;
  onDelete: () => void;
  onDone: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-3 rounded-md px-3 py-2.5 shadow-[inset_0_0_0_1px_var(--color-highlight)]">
      <span id="list-order" className="sr-only">
        Order
      </span>
      <ToggleGroup
        variant="outline"
        size="sm"
        spacing={0}
        aria-labelledby="list-order"
        value={[sort]}
        onValueChange={(value) => value[0] && value[0] !== sort && onSort(value[0] as GameListSort)}
      >
        {GAME_LIST_SORTS.map((s) => (
          <ToggleGroupItem key={s} value={s} className="px-3">
            {SORT_LABEL[s]}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      {canChangeVisibility && (
        <div className="flex items-center">
          <span id="list-private" className="sr-only">
            Who sees it
          </span>
          <FeatureSwitch
            checked={isPrivate}
            pending={pending}
            onChange={onPrivate}
            onLabel="Private"
            offLabel="Members"
            labelledBy="list-private"
          />
        </div>
      )}
      <div className="ml-auto flex items-center gap-2 max-sm:w-full">
        {canDelete && (
          <Button variant="destructive-outline" size="sm" onClick={onDelete}>
            <Trash2 aria-hidden />
            Delete list
          </Button>
        )}
        <Button variant="highlight" size="sm" onClick={onDone} className="max-sm:ml-auto">
          <Check aria-hidden />
          Done
        </Button>
      </div>
    </div>
  );
}
