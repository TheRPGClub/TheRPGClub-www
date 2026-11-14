import {
  RARITY_TIER_LABEL,
  formatRarity,
  rarityTier,
  type RarityTier,
} from "@/lib/achievements";
import { Badge } from "@/components/ui/badge";
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
    <Badge
      tone={`rarity-${tier}`}
      size={size === "sm" ? "sm" : "default"}
      className={cn("border-0", className)}
    >
      {RARITY_TIER_LABEL[tier]}
      {showFigure && ` · ${formatRarity(rarity)}`}
      {showFigure && hardcore != null && ` · HC ${formatRarity(hardcore)}`}
    </Badge>
  );
}
