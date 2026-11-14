"use client";

import { displayRarity, isSpoiler } from "@/lib/achievements";
import { formatSlot, type SlottedAchievement } from "@/lib/achievements/set-page";
import { AchievementIcon } from "@/components/achievements/achievement-icon";
import { RarityChip } from "@/components/achievements/rarity-chip";
import { Button } from "@/components/ui/button";
import { AchievementName, type SpreadViewProps } from "./shared";

// A tray below the timeline: the Achievements still to unlock (locked and
// hidden ones), or Unlocks the Provider gave no date, as cards.
export function Tray({
  title,
  note,
  group,
  tint,
  selectedId,
  onSelect,
  inlineId,
  inlineDetail,
}: SpreadViewProps & { title: string; note: string; group: SlottedAchievement[] }) {
  const picked = group.find((i) => i.view.id === selectedId);
  return (
    <section aria-label={title} className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b-2 border-foreground pb-2">
        <h3 className="font-headline text-[1.875rem] leading-[0.9] text-foreground">{title}</h3>
        <span className="font-label text-[0.85rem] text-faint-foreground">{note}</span>
      </div>
      <ul className="grid gap-3 sm:grid-cols-[repeat(auto-fill,minmax(15rem,1fr))]">
        {group.map((item) => {
          const { view, slot } = item;
          const selected = selectedId === view.id;
          const sealed = isSpoiler(view) && !view.unlocked;
          const shown = displayRarity(view);
          return (
            <li key={view.id}>
              <Button
                variant="pick-card"
                size="bare"
                aria-pressed={selected}
                onClick={() => onSelect(view.id)}
                className="grid w-full grid-cols-[3.5rem_minmax(0,1fr)] items-center gap-3 p-2.5"
              >
                <AchievementIcon view={view} size="md" slot={slot} tint={tint.tint} />
                <span className="flex min-w-0 flex-col gap-1.5">
                  <span className="flex min-w-0 items-baseline gap-1.5">
                    <span className="font-headline text-[1rem]" style={{ color: tint.tint }}>
                      {formatSlot(slot)}
                    </span>
                    <AchievementName
                      view={view}
                      className="truncate text-[0.95rem] font-semibold text-dim-foreground"
                    />
                  </span>
                  {sealed ? (
                    <span className="font-label inline-flex h-5 w-fit items-center rounded-xs bg-foreground/8 px-1.5 text-[0.72rem] text-dim-foreground">
                      Hidden
                    </span>
                  ) : (
                    <RarityChip rarity={view.rarity} figure={shown.rarity} size="sm" className="w-fit" />
                  )}
                </span>
              </Button>
            </li>
          );
        })}
      </ul>
      {picked && picked.view.id === inlineId && inlineDetail(picked)}
    </section>
  );
}
