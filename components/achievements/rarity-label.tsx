import { Gem } from "lucide-react";
import { formatRarity } from "@/lib/achievements";
import { cn } from "@/lib/utils";

// The Provider's Rarity in the label voice. An ultra-rare Achievement (under
// the Highlight line on its overall Rarity, see displayRarity) also wears
// "Ultra rare" on a paper chip, the loudest neutral there is.
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
        "font-label inline-flex items-center gap-1.5 text-[0.78rem] whitespace-nowrap text-paper-mute",
        className,
      )}
    >
      {ultraRare && chip && (
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
