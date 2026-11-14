"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import type { Game, ImportIgdbCandidate } from "@/lib/api/types";
import type { ImportKind } from "@/lib/imports/kinds";
import { ImportIgdbSuggestions } from "@/components/imports/import-igdb-suggestions";
import { ImportRoute } from "@/components/issue/import-item-layout";
import { GamePicker } from "@/components/member/game-picker";
import { Button } from "@/components/ui/button";

// The routes beside an item that every import kind offers: pick any GameDB
// game, or find it on IGDB.

export function GameDbPickRoute({
  defaultOpen,
  disabled,
  onUse,
}: {
  defaultOpen?: boolean;
  disabled: boolean;
  onUse: (game: Game) => void;
}) {
  const [picked, setPicked] = useState<Game | null>(null);
  return (
    <ImportRoute title="Pick from GameDB" defaultOpen={defaultOpen}>
      <div className="flex flex-col gap-2">
        <GamePicker compact placeholder="Search GameDB…" onPick={setPicked} />
        <Button
          type="button"
          variant="highlight"
          disabled={disabled || !picked}
          onClick={() => picked && onUse(picked)}
        >
          <Check data-icon="inline-start" /> Use this game
        </Button>
      </div>
    </ImportRoute>
  );
}

export function IgdbRoute({
  kind,
  itemId,
  title,
  disabled,
  onChoose,
}: {
  kind: ImportKind;
  itemId: number;
  // The title to look up first.
  title: string;
  disabled: boolean;
  onChoose: (hit: ImportIgdbCandidate) => void;
}) {
  return (
    <ImportRoute title="Not in GameDB? Try IGDB">
      <ImportIgdbSuggestions
        kind={kind}
        itemId={itemId}
        initialQuery={title}
        disabled={disabled}
        onChoose={onChoose}
      />
    </ImportRoute>
  );
}
