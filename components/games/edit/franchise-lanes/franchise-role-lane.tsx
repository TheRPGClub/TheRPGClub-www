"use client";

import type { FranchisesStage, GameFranchises } from "@/lib/games/game-edit";
import {
  franchisePicked,
  franchiseStagedForCreate,
  moveFranchise,
  stageFranchiseInLane,
  stageFranchiseParent,
  stageFranchiseUnlink,
  unstageFranchise,
  unstageFranchiseParent,
  type FranchiseLanes,
  type FranchiseRole,
} from "@/lib/games/game-edit/franchises";
import { LANE_COPY } from "@/lib/games/game-edit/franchise-lanes-copy";
import { FranchiseLane } from "@/components/games/edit/franchise-lanes/franchise-lane";
import { LaneFranchise } from "@/components/games/edit/franchise-lanes/lane-franchise";
import { LaneAddSlot, SlotPanel, type SlotExtra } from "@/components/games/edit/franchise-lanes/lane-add-slot";
import { AddOnParentLine } from "@/components/games/edit/franchise-lanes/add-on-parent-line";
import { ParentGameSearch } from "@/components/games/edit/franchise-lanes/parent-game-search";

// One lane of the Franchises tab, wired to the stage. `asking` (Add-on of
// only) is a parent being asked for: for the row `key` moving in, or for
// Change when `key` is null.
export function FranchiseRoleLane({
  role,
  gameId,
  loaded,
  staged,
  lanes,
  isAddOn,
  open,
  asking,
  onOpen,
  onClose,
  onAsk,
  onStage,
  suggest,
}: {
  role: FranchiseRole;
  gameId: number;
  loaded: GameFranchises;
  staged: FranchisesStage | undefined;
  lanes: FranchiseLanes;
  isAddOn: boolean;
  open: boolean;
  asking: { key: string | null } | null;
  onOpen: () => void;
  onClose: () => void;
  onAsk: (key: string | null) => void;
  onStage: (next: FranchisesStage | undefined) => void;
  // The lane's suggestions (www#209; laneSuggestionSlot).
  suggest?: { extra?: SlotExtra; omit?: (franchiseId: number) => boolean; hint?: string };
}) {
  const copy = LANE_COPY[role];
  const addon = role === "addon";
  const askingRow = asking?.key ? lanes.mainline.concat(lanes.spinoff).find((r) => r.key === asking.key) : null;
  const slot = asking ? (
    <SlotPanel label="Pick the parent game">
      <ParentGameSearch
        gameId={gameId}
        question={askingRow ? `${askingRow.name}: which game is this an Add-on of?` : "Which game is this an Add-on of?"}
        onPick={(parent) => {
          onStage(asking.key ? moveFranchise(loaded, staged, asking.key, "addon", parent) : stageFranchiseParent(loaded, staged, parent));
          onClose();
        }}
        onClose={onClose}
      />
    </SlotPanel>
  ) : (
    <LaneAddSlot
      gameId={gameId}
      laneTitle={copy.title}
      roleLabel={copy.button}
      open={open}
      onOpen={onOpen}
      onClose={onClose}
      needsParent={addon && !isAddOn}
      picked={(id) => franchisePicked(loaded, staged, id)}
      staged={(name) => franchiseStagedForCreate(staged, name)}
      onAdd={(franchise, parent) => onStage(stageFranchiseInLane(loaded, staged, franchise, role, parent))}
      {...suggest}
    />
  );

  return (
    <FranchiseLane
      role={role}
      rows={lanes[role]}
      last={addon}
      lead={
        addon &&
        lanes.parent && (
          <AddOnParentLine parent={lanes.parent} onChange={() => onAsk(null)} onUndo={() => onStage(unstageFranchiseParent(staged))} />
        )
      }
      empty={!addon && isAddOn ? "An Add-on sits in Add-on of" : undefined}
      note={
        addon
          ? isAddOn
            ? "The parent game is the game's, so it holds in every Franchise it's in."
            : "Pick the Franchise, then its parent game."
          : isAddOn && (open || lanes[role].length > 0)
            ? "Adding here makes the game a full game again, in every Franchise."
            : undefined
      }
      slot={slot}
      renderRow={(row) => (
        <LaneFranchise
          key={row.key}
          row={row}
          onMove={(to) => (to === "addon" && !isAddOn ? onAsk(row.key) : onStage(moveFranchise(loaded, staged, row.key, to)))}
          onUnlink={() => row.franchise_id && onStage(stageFranchiseUnlink(loaded, staged, row.franchise_id))}
          onUndo={() => onStage(unstageFranchise(staged, row.key))}
        />
      )}
    />
  );
}
