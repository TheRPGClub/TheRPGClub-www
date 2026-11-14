"use client";

import type { GameListKind } from "@/lib/api/game-list-entry";
import type { Game, Platform } from "@/lib/api/types";
import { COMPLETION_TYPES, OWNERSHIP_TYPES } from "@/lib/game-lists/entry-meta";
import type { GameListOptions } from "@/hooks/use-game-list-editor";
import { Button } from "@/components/ui/button";
import { GamePicker } from "../game-picker";
import { ListOptionSelect } from "./list-option-select";

const asItems = (values: readonly string[]) => values.map((value) => ({ value, label: value }));

// The open add panel above a list's shelf: the options the game is added
// with, then the game picker.
export function AddGamePanel({
  kind,
  title,
  platforms,
  options,
  pending,
  igdbBlockedReason,
  onPick,
  onCancel,
}: {
  kind: GameListKind;
  title: string;
  platforms: Platform[];
  options: GameListOptions;
  pending: boolean;
  igdbBlockedReason: string | null;
  onPick: (game: Game) => void;
  onCancel: () => void;
}) {
  const showPlatform = platforms.length > 0 && kind !== "favorite";

  return (
    <div className="space-y-2.5 rounded-md border border-highlight bg-card p-3 sm:p-3.5">
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-label mr-auto text-[0.95rem] font-extrabold tracking-[0.06em] text-highlight">
          Add to {title}
        </p>
        <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={pending}>
          Cancel
        </Button>
      </div>
      {(showPlatform || kind === "completed" || kind === "collection") && (
        <div className="grid gap-2 sm:grid-cols-2">
          {showPlatform && (
            <ListOptionSelect<number | null>
              label="Platform"
              items={[
                { value: null, label: "Platform (optional)…" },
                ...platforms.map((p) => ({ value: p.platform_id, label: p.platform_name })),
              ]}
              value={options.platformId}
              onValueChange={options.setPlatformId}
            />
          )}
          {kind === "completed" && (
            <ListOptionSelect
              label="Completion type"
              items={asItems(COMPLETION_TYPES)}
              value={options.completionType}
              onValueChange={options.setCompletionType}
            />
          )}
          {kind === "collection" && (
            <ListOptionSelect
              label="Ownership type"
              items={asItems(OWNERSHIP_TYPES)}
              value={options.ownershipType}
              onValueChange={options.setOwnershipType}
            />
          )}
        </div>
      )}
      <GamePicker
        compact
        autoFocus
        onPick={onPick}
        igdbFallback={{ listLabel: title, blockedReason: igdbBlockedReason }}
        placeholder={`Search games to add to ${title.toLowerCase()}…`}
      />
    </div>
  );
}
