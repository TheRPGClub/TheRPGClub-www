"use client";

import { Check, X } from "lucide-react";
import type { Game } from "@/lib/api/types";
import { DONATE_PLATFORMS, MAX_PLATFORM } from "@/lib/giveaways";
import { GamePicker } from "@/components/member/game-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

// On a Label the Theme gives the ink: pass the type alone.
export const DONATE_LABEL_TYPE = "font-label mb-1.5 block text-sm";
export const DONATE_LABEL = `${DONATE_LABEL_TYPE} text-background`;
export const OTHER_PLATFORM = "Other";
// The IGDB fallback is drawn for the dark page, so it sits on a dark panel
// here (bg-background, so its bg-muted "You stay here" note still stands out).
const IGDB_PANEL = "rounded-sm border border-background bg-background p-2.5 text-foreground";

// The donated key's game: the GameDB picker, or the picked game on an ink
// chip with its Change.
export function DonateGameField({
  game,
  pickerKey,
  onPick,
  onChange,
}: {
  game: Game | null;
  // Bumped to start the picker over.
  pickerKey: number;
  onPick: (game: Game) => void;
  onChange: () => void;
}) {
  return (
    <div className="mb-4">
      <span className={DONATE_LABEL} id="donate-game">
        Game
      </span>
      {game ? (
        <div className="flex h-9 items-center gap-2 rounded-sm border border-background bg-background pr-1 pl-3 text-sm text-foreground">
          <Check aria-hidden className="size-4 text-highlight" />
          <span className="min-w-0 flex-1 truncate font-semibold">{game.title}</span>
          <Button variant="field-tool" size="icon-sm" aria-label="Change game" onClick={onChange}>
            <X className="size-4" />
          </Button>
        </div>
      ) : (
        <GamePicker
          key={pickerKey}
          compact
          variant="inverse"
          onPick={onPick}
          placeholder="Search the GameDB…"
          igdbFallback={{ purpose: "donation", blockedReason: null, className: IGDB_PANEL, offerWithMatches: true }}
        />
      )}
    </div>
  );
}

// The key's platform: one of the usual stores, or Other with its name typed.
export function DonatePlatformField({
  platform,
  otherPlatform,
  onPlatform,
  onOtherPlatform,
}: {
  platform: string;
  otherPlatform: string;
  onPlatform: (platform: string) => void;
  onOtherPlatform: (name: string) => void;
}) {
  return (
    <fieldset className="mb-4">
      <legend className={DONATE_LABEL}>Platform</legend>
      <ToggleGroup
        variant="inverse"
        size="sm"
        spacing={1.5}
        value={platform ? [platform] : []}
        // A pressed platform stays picked: a press on it again changes nothing.
        onValueChange={(next) => {
          if (next[0]) onPlatform(next[0]);
        }}
        className="flex-wrap"
      >
        {[...DONATE_PLATFORMS, OTHER_PLATFORM].map((p) => (
          <ToggleGroupItem key={p} value={p} className="text-[0.82rem]">
            {p}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      {platform === OTHER_PLATFORM && (
        <Input
          aria-label="Platform name"
          value={otherPlatform}
          maxLength={MAX_PLATFORM}
          onChange={(e) => onOtherPlatform(e.target.value)}
          placeholder="e.g. itch.io, Humble"
          variant="inverse"
          className="mt-2"
        />
      )}
    </fieldset>
  );
}
