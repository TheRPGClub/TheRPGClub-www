"use client";

import {
  displayRarity,
  formatRarity,
  formatUnlockDate,
  isSpoiler,
} from "@/lib/achievements";
import { formatSlot, type SlottedAchievement } from "@/lib/achievements/set-page";
import { AchievementIcon } from "@/components/achievements/achievement-icon";
import { Button } from "@/components/ui/button";
import { AchievementName } from "./shared";
import { cn } from "@/lib/utils";

// One Achievement in its Rarity band: an Unlock as a die-cut tile, a locked
// one as a dashed numbered slot, over its number, name, Rarity and the shown
// member's Unlock date.
export function RarityItem({
  item,
  tint,
  selected,
  onSelect,
}: {
  item: SlottedAchievement;
  tint: string;
  selected: boolean;
  onSelect: (id: number) => void;
}) {
  const { view, slot } = item;
  const sealed = isSpoiler(view) && !view.unlocked;
  const shown = displayRarity(view);
  return (
    <Button
      variant="pick-tile"
      size="bare"
      aria-pressed={selected}
      onClick={() => onSelect(view.id)}
      className="flex w-full flex-col gap-2 p-1.5"
    >
      <AchievementIcon
        view={view}
        size="lg"
        slot={slot}
        tint={tint}
        className="max-sm:size-[4.25rem]"
      />
      <span className="flex min-w-0 flex-col gap-0.5">
        <span
          className={cn(
            "line-clamp-3 text-[0.82rem] leading-tight font-semibold break-words sm:text-[0.92rem]",
            view.unlocked ? "text-foreground" : "text-dim-foreground",
          )}
        >
          <span
            className={cn(
              "font-headline mr-1.5 text-[1.05rem] font-normal",
              !view.unlocked && "opacity-60",
            )}
            style={{ color: tint }}
          >
            {formatSlot(slot)}
          </span>
          <AchievementName view={view} />
        </span>
        <span className="text-[0.78rem] text-faint-foreground">
          {sealed
            ? "Hidden"
            : [
                shown.rarity != null ? formatRarity(shown.rarity) : null,
                view.unlockedAt ? formatUnlockDate(view.unlockedAt) : "not yet",
              ]
                .filter(Boolean)
                .join(" · ")}
        </span>
      </span>
    </Button>
  );
}
