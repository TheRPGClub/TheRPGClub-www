"use client";

import { RARITY_TIER_LABEL } from "@/lib/achievements";
import { rarityBands, type SlottedAchievement } from "@/lib/achievements/set-page";
import { Progress } from "@/components/ui/progress";

// How much of each Rarity band the shown member has, each bar in its
// tier's ink.
export function RarityTally({ items }: { items: SlottedAchievement[] }) {
  const bands = rarityBands(items).filter((b) => b.items.length > 0);
  return (
    <section aria-label="Unlocks by Rarity" className="flex flex-col gap-3">
      <h3 className="font-headline border-b-2 border-foreground pb-1.5 text-[1.5rem] leading-[0.95] text-foreground">
        By Rarity
      </h3>
      <ul className="flex flex-col gap-3">
        {bands.map((band) => {
          const label = band.tier ? RARITY_TIER_LABEL[band.tier] : "No Rarity";
          const ink = band.tier ? `var(--color-rarity-${band.tier})` : "var(--color-faint-foreground)";
          return (
            <li key={band.tier ?? "none"} className="grid grid-cols-[7rem_minmax(0,1fr)_3rem] items-center gap-3">
              <span className="font-label text-[0.85rem] text-dim-foreground">{label}</span>
              <Progress
                value={band.unlocked}
                max={band.items.length}
                tone="tint"
                size="lg"
                aria-label={`${label} unlocked`}
                aria-valuetext={`${band.unlocked} of ${band.items.length}`}
                style={{ "--progress-ink": ink } as React.CSSProperties}
              />
              <span className="font-headline text-right text-[1.05rem] text-foreground">
                {band.unlocked}
                <span className="text-faint-foreground">/{band.items.length}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
