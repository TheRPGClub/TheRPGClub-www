"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import type { FranchisesStage, GameFranchises } from "@/lib/games/game-edit";
import {
  effectiveParent,
  FRANCHISE_ROLES,
  franchiseLanes,
  franchisesSection,
  type FranchiseRole,
} from "@/lib/games/game-edit/franchises";
import { EditSection } from "@/components/games/edit/edit-section";
import type { CardGame } from "@/lib/games/game-edit/franchise-card";
import { useFranchiseRuns } from "@/hooks/use-franchise-runs";
import { FranchiseRoleLane } from "@/components/games/edit/franchise-lanes/franchise-role-lane";

// The Franchises tab (design pick edit-lanes, www#207): the game's Series
// read only, then three role lanes, Mainline in, Spin-off of and Add-on of,
// each listing its Franchises as context cards (www#208) with its own
// + Add slot. Changes stage with Edited, Added and Removing marks, each
// with an Undo, until Save all.
export function FranchisesTab({
  gameId,
  game,
  loaded,
  staged,
  error,
  series,
  onStage,
}: {
  gameId: number;
  game: CardGame;
  loaded: GameFranchises;
  staged: FranchisesStage | undefined;
  error?: string;
  series: string | null;
  onStage: (next: FranchisesStage | undefined) => void;
}) {
  // The one open + Add slot; a parent asked for in Add-on of (a move into
  // it, or Change) opens that lane's slot on its parent search.
  const [open, setOpen] = useState<FranchiseRole | null>(null);
  const [asking, setAsking] = useState<{ key: string | null } | null>(null);
  const lanes = franchiseLanes(loaded, staged);
  const count = staged ? franchisesSection.changes(loaded, staged) : 0;
  const isAddOn = !!effectiveParent(loaded, staged);
  // Each card's run, read again after a save changes the record.
  const ids = [...lanes.mainline, ...lanes.spinoff, ...lanes.addon].flatMap((r) => (r.franchise_id && r.franchise_id > 0 ? [r.franchise_id] : []));
  const runOf = useFranchiseRuns(ids, JSON.stringify(loaded));

  return (
    <EditSection
      title="Franchises"
      error={error}
      actions={count > 0 && <span className="font-label text-[0.8rem] font-extrabold tracking-[0.08em] text-highlight">{count} staged</span>}
    >
      {series && (
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-border pb-3 text-[0.92rem] text-dim-foreground">
          <span className="font-label w-22 text-[0.78rem] font-bold tracking-[0.08em] text-faint-foreground">Series</span>
          <span className="font-semibold text-foreground">{series}</span>
          <Lock role="img" aria-label="Read only" className="size-3.5 text-faint-foreground" />
        </p>
      )}
      {FRANCHISE_ROLES.map((role) => (
        <FranchiseRoleLane
          key={role}
          role={role}
          gameId={gameId}
          game={game}
          runOf={runOf}
          loaded={loaded}
          staged={staged}
          lanes={lanes}
          isAddOn={isAddOn}
          open={open === role}
          asking={role === "addon" ? asking : null}
          onOpen={() => {
            setOpen(role);
            setAsking(null);
          }}
          onClose={() => {
            setOpen(null);
            setAsking(null);
          }}
          onAsk={(key) => {
            setOpen("addon");
            setAsking({ key });
          }}
          onStage={onStage}
        />
      ))}
    </EditSection>
  );
}
