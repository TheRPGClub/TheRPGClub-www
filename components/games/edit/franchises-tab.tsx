"use client";

import { Lock } from "lucide-react";
import type { FranchisesStage, GameFranchiseRef } from "@/lib/games/game-edit";
import {
  franchisePicked,
  franchiseStagedForCreate,
  franchisesView,
  stageFranchiseCreate,
  stageFranchiseLink,
  stageFranchiseMainline,
  stageFranchiseUnlink,
  unstageFranchise,
} from "@/lib/games/game-edit/franchises";
import { EditSection } from "@/components/games/edit/edit-section";
import { FranchiseLinkSearch } from "@/components/games/edit/franchise-link-search";
import { FranchiseRowItem } from "@/components/games/edit/franchise-row";

// The Franchises tab (design pick 7A, "staged rows, Save all"): the game's
// Series read only, then one ruled row per Franchise with a Mainline / Other
// control that hugs its two words, and Unlink. Changes stage with Edited,
// Added and Removing marks, each with an Undo, until Save all.
export function FranchisesTab({
  loaded,
  staged,
  error,
  series,
  onStage,
}: {
  loaded: GameFranchiseRef[];
  staged: FranchisesStage | undefined;
  error?: string;
  series: string | null;
  onStage: (next: FranchisesStage | undefined) => void;
}) {
  const rows = franchisesView(loaded, staged);

  return (
    <EditSection
      title="Franchises"
      error={error}
      actions={
        <FranchiseLinkSearch
          picked={(id) => franchisePicked(loaded, staged, id)}
          staged={(name) => franchiseStagedForCreate(staged, name)}
          onPick={(f) => onStage(stageFranchiseLink(loaded, staged, f))}
          onCreate={(name) => onStage(stageFranchiseCreate(staged, name))}
        />
      }
    >
      {series && (
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-border pb-3 text-[0.92rem] text-dim-foreground">
          <span className="font-label w-22 text-[0.78rem] font-bold tracking-[0.08em] text-faint-foreground">Series</span>
          <span className="font-semibold text-foreground">{series}</span>
          <span className="font-label inline-flex items-center gap-1 text-[0.72rem] font-bold tracking-[0.07em] text-faint-foreground">
            <Lock aria-hidden className="size-3" />
            From IGDB, read only
          </span>
        </p>
      )}
      {rows.length === 0 ? (
        <p className="py-6 text-[0.95rem] text-faint-foreground">This game isn&apos;t in a Franchise yet.</p>
      ) : (
        <ul aria-label="Franchises">
          {rows.map((row) => (
            <FranchiseRowItem
              key={row.key}
              row={row}
              onMainline={(mainline) => onStage(stageFranchiseMainline(loaded, staged, row.key, mainline))}
              onUnlink={() => row.franchise_id && onStage(stageFranchiseUnlink(loaded, staged, row.franchise_id))}
              onUndo={() => onStage(unstageFranchise(staged, row.key))}
            />
          ))}
        </ul>
      )}
    </EditSection>
  );
}
