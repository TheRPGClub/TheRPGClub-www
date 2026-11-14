import { RARITY_TIER_LABEL, formatRarity } from "@/lib/achievements";
import { cn } from "@/lib/utils";
import { RARITY_FILL } from "./rarity-chip";

// The Provider's Rarity in the label voice. An ultra-rare Achievement (under
// the Highlight line on its overall Rarity, see displayRarity) also wears
// the "Ultra rare" chip in its Rarity ink.
export function RarityLabel({
  rarity,
  ultraRare,
  hardcore = false,
  chip = true,
  className,
}: {
  rarity: number | null | undefined;
  // From displayRarity: the overall Rarity is under the Highlight line.
  ultraRare: boolean;
  // The figure is RetroAchievements' hardcore Rarity.
  hardcore?: boolean;
  // Show the "Ultra rare" chip when ultraRare. Off where it is already shown.
  chip?: boolean;
  className?: string;
}) {
  if (rarity == null) return null;
  return (
    <span
      className={cn(
        "font-label inline-flex items-center gap-1.5 text-[0.78rem] whitespace-nowrap text-faint-foreground",
        className,
      )}
    >
      {ultraRare && chip && (
        <span
          className={cn(
            "inline-flex h-5 items-center rounded-xs px-1.5 text-[0.72rem] text-rarity-foreground",
            RARITY_FILL.ultra,
          )}
        >
          {RARITY_TIER_LABEL.ultra}
        </span>
      )}
      <span>
        {formatRarity(rarity)} of players{hardcore ? " (hardcore)" : ""}
      </span>
    </span>
  );
}
