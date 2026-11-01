import { Gem } from "lucide-react";
import { formatRarity, isUltraRare } from "@/lib/achievements";
import { cn } from "@/lib/utils";

// The Provider's Rarity in the label voice. Under 5% (the Highlight line)
// it reads "Ultra rare" on a paper chip, the loudest neutral there is.
export function RarityLabel({
  rarity,
  hardcore = false,
  chip = true,
  className,
}: {
  rarity: number | null | undefined;
  // The figure is RetroAchievements' hardcore Rarity.
  hardcore?: boolean;
  // Show the "Ultra rare" chip under 5%. Off where the chip is already shown.
  chip?: boolean;
  className?: string;
}) {
  if (rarity == null) return null;
  const ultra = isUltraRare(rarity);
  return (
    <span
      className={cn(
        "font-label inline-flex items-center gap-1.5 text-[0.78rem] whitespace-nowrap text-paper-mute",
        className,
      )}
    >
      {ultra && chip && (
        <span className="inline-flex h-5 items-center gap-1 rounded-xs bg-paper px-1.5 text-ink [&_svg]:size-3">
          <Gem aria-hidden />
          Ultra rare
        </span>
      )}
      <span>
        {formatRarity(rarity)} of players{hardcore ? " (hardcore)" : ""}
      </span>
    </span>
  );
}
