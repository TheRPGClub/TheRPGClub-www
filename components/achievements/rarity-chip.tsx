import {
  RARITY_TIER_LABEL,
  formatRarity,
  rarityTier,
  type RarityTier,
} from "@/lib/achievements";
import { cn } from "@/lib/utils";

// A Rarity tier as a solid chip in its ink, with ink type: "Ultra rare ·
// 2.1%". The tier follows the overall Rarity (as the die-cut edge and the
// `rare` Highlight do), so the overall figure always prints. A different
// `figure` (displayRarity's hardcore one) prints after it: "Rare · 6.5% ·
// HC 3.1%". Renders nothing without a Rarity.
export const RARITY_FILL: Record<RarityTier, string> = {
  common: "bg-rarity-common",
  uncommon: "bg-rarity-uncommon",
  rare: "bg-rarity-rare",
  ultra: "bg-rarity-ultra",
};

export function RarityChip({
  rarity,
  figure,
  showFigure = true,
  size = "md",
  className,
}: {
  rarity: number | null | undefined;
  figure?: number | null;
  showFigure?: boolean;
  size?: "sm" | "md";
  className?: string;
}) {
  const tier = rarityTier(rarity);
  if (!tier || rarity == null) return null;
  const hardcore = figure != null && figure !== rarity ? figure : null;
  return (
    <span
      className={cn(
        "font-label inline-flex items-center rounded-xs whitespace-nowrap text-rarity-foreground",
        size === "sm" ? "h-5 px-1.5 text-[0.72rem]" : "h-6 px-2 text-[0.78rem]",
        RARITY_FILL[tier],
        className,
      )}
    >
      {RARITY_TIER_LABEL[tier]}
      {showFigure && ` · ${formatRarity(rarity)}`}
      {showFigure && hardcore != null && ` · HC ${formatRarity(hardcore)}`}
    </span>
  );
}
