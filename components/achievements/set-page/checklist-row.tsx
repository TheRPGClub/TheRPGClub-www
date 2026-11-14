"use client";

import { Check } from "lucide-react";
import {
  displayRarity,
  formatUnlockDate,
  isSpoiler,
} from "@/lib/achievements";
import { formatSlot, type SlottedAchievement } from "@/lib/achievements/set-page";
import { AchievementIcon } from "@/components/achievements/achievement-icon";
import { RarityChip } from "@/components/achievements/rarity-chip";
import { Button } from "@/components/ui/button";
import { AchievementName } from "./shared";
import { cn } from "@/lib/utils";

// One checklist row: number, tick, icon, name, Rarity and the shown
// member's Unlock date (or "Not yet").
export function ChecklistRow({
  item,
  tint,
  contrast,
  selected,
  onSelect,
}: {
  item: SlottedAchievement;
  tint: string;
  contrast: string;
  selected: boolean;
  onSelect: (id: number) => void;
}) {
  const { view, slot } = item;
  const sealed = isSpoiler(view) && !view.unlocked;
  const shown = displayRarity(view);
  return (
    <Button
      variant="pick-row"
      size="bare"
      aria-pressed={selected}
      onClick={() => onSelect(view.id)}
      className={cn(
        "grid w-full items-center gap-x-3 px-2 py-2.5 sm:gap-x-4 sm:px-3",
        "grid-cols-[2.4rem_1.25rem_2.5rem_minmax(0,1fr)] sm:grid-cols-[3rem_1.4rem_3.5rem_minmax(0,1fr)_auto_7.5rem]",
      )}
    >
      <span
        className={cn(
          "font-headline text-[1.9rem] leading-none sm:text-[2.4rem]",
          !view.unlocked && "opacity-55",
        )}
        style={{ color: tint }}
      >
        {formatSlot(slot)}
      </span>
      <span
        aria-hidden
        className={cn(
          "grid size-5 place-items-center rounded-[3px] sm:size-[1.4rem]",
          view.unlocked ? "" : "border-[1.5px] border-border-strong",
        )}
        style={view.unlocked ? { background: tint } : undefined}
      >
        {view.unlocked && <Check className="size-3.5" style={{ color: contrast }} strokeWidth={3.5} />}
      </span>
      <AchievementIcon view={view} size="sm" tint={tint} className="sm:size-14" />
      <span className="flex min-w-0 flex-col gap-1">
        <AchievementName
          view={view}
          className={cn(
            "truncate text-[1rem] font-semibold sm:text-[1.05rem]",
            view.unlocked ? "text-foreground" : "text-dim-foreground",
          )}
        />
        <span className="font-label flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.78rem] whitespace-nowrap text-faint-foreground sm:hidden">
          {sealed ? (
            <span>Hidden</span>
          ) : (
            <RarityChip rarity={view.rarity} figure={shown.rarity} size="sm" />
          )}
          <span className={cn(!view.unlockedAt && "italic normal-case tracking-normal")}>
            {view.unlockedAt ? formatUnlockDate(view.unlockedAt) : "Not yet"}
          </span>
        </span>
        <span className="sr-only">{view.unlocked ? "Unlocked" : "Not unlocked"}</span>
      </span>
      <span className="hidden justify-self-start sm:block">
        {sealed ? (
          <span className="font-label inline-flex h-5 items-center rounded-xs bg-foreground/8 px-1.5 text-[0.72rem] text-dim-foreground">
            Hidden
          </span>
        ) : (
          <RarityChip rarity={view.rarity} figure={shown.rarity} size="sm" />
        )}
      </span>
      <span
        className={cn(
          "hidden text-right text-[0.88rem] sm:block",
          view.unlockedAt ? "text-dim-foreground" : "text-faint-foreground italic",
        )}
      >
        {view.unlockedAt ? formatUnlockDate(view.unlockedAt) : "Not yet"}
      </span>
    </Button>
  );
}
