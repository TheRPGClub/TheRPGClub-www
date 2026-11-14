"use client";

import {
  displayRarity,
  formatUnlockDate,
  isSpoiler,
} from "@/lib/achievements";
import type { HeadlineReason, SlottedAchievement } from "@/lib/achievements/set-page";
import { AchievementIcon } from "@/components/achievements/achievement-icon";
import { RarityChip } from "@/components/achievements/rarity-chip";
import { Button } from "@/components/ui/button";
import { AchievementName, HeadlineChip } from "./shared";

// The checklist's headline Achievement as a hero on the game tint: the
// large tile, the name, its description, why it heads the set, its Rarity
// and the shown member's Unlock.
export function ChecklistHero({
  item,
  reason,
  tint,
  contrast,
  selected,
  onSelect,
}: {
  item: SlottedAchievement;
  reason: HeadlineReason;
  tint: string;
  contrast: string;
  selected: boolean;
  onSelect: (id: number) => void;
}) {
  const { view, slot } = item;
  const spoiler = isSpoiler(view);
  const shown = displayRarity(view);
  return (
    <Button
      variant="pick"
      size="bare"
      aria-pressed={selected}
      onClick={() => onSelect(view.id)}
      className="grid w-full grid-cols-[auto_minmax(0,1fr)] content-center items-center gap-x-5 gap-y-3 p-5 sm:gap-x-7 sm:p-7"
      style={{ background: tint, color: contrast }}
    >
      <AchievementIcon
        view={view}
        size="xl"
        slot={slot}
        tint={contrast}
        className="max-sm:size-20 sm:row-span-3"
      />
      <AchievementName
        view={view}
        className="font-headline block self-end text-[2.25rem] leading-[0.92] [overflow-wrap:anywhere] max-sm:self-center sm:text-[3rem]"
      />
      {view.description && !spoiler && (
        <span className="line-clamp-3 max-w-[52ch] text-[0.95rem] leading-snug max-sm:col-span-2">
          {view.description}
        </span>
      )}
      <span className="font-label flex flex-wrap items-center gap-x-3 gap-y-1.5 self-start text-[0.85rem] max-sm:col-span-2">
        <HeadlineChip
          reason={reason}
          className="shadow-[0_0_0_2px_color-mix(in_oklab,var(--color-background)_35%,transparent)]"
          style={{ background: contrast, color: tint }}
        />
        {!(spoiler && !view.unlocked) && (
          <RarityChip
            rarity={view.rarity}
            figure={shown.rarity}
            className="shadow-[0_0_0_2px_color-mix(in_oklab,var(--color-background)_35%,transparent)]"
          />
        )}
        <span>
          {view.unlockedAt ? `Unlocked ${formatUnlockDate(view.unlockedAt)}` : "Not yet unlocked"}
        </span>
      </span>
    </Button>
  );
}
