import type { AchievementTier } from "@/lib/api/types";
import type { AchievementView, RarityTier } from "@/lib/achievements";

// The die-cut tile's measures per size, the PSN tier metals and the Rarity
// inks of its edge, shared by AchievementIcon and its faces.

export const TIER_RING: Record<AchievementTier, string> = {
  bronze: "var(--color-tier-bronze)",
  silver: "var(--color-tier-silver)",
  gold: "var(--color-tier-gold)",
  platinum: "#d6e4ec",
};

export const RARITY_EDGE: Record<RarityTier, string> = {
  common: "border-rarity-common",
  uncommon: "border-rarity-uncommon",
  rare: "border-rarity-rare",
  ultra: "border-rarity-ultra",
};

export const SIZE = {
  sm: {
    box: "size-10",
    inset: "inset-[2px]",
    edge: "border-[3px]",
    glyph: "size-4",
    mark: "text-lg",
    dot: "size-2",
    label: false,
  },
  md: {
    box: "size-14",
    inset: "inset-[3px]",
    edge: "border-[3px]",
    glyph: "size-5",
    mark: "text-2xl",
    dot: "size-2.5",
    label: false,
  },
  lg: {
    box: "size-20",
    inset: "inset-1",
    edge: "border-[3px]",
    glyph: "size-7",
    mark: "text-4xl",
    dot: "size-3",
    label: true,
  },
  xl: {
    box: "size-32",
    inset: "inset-1.5",
    edge: "border-[5px]",
    glyph: "size-10",
    mark: "text-6xl",
    dot: "size-4",
    label: true,
  },
} as const;

export type AchievementIconSize = keyof typeof SIZE;

export type AchievementIconView = Pick<
  AchievementView,
  | "id"
  | "iconUrl"
  | "iconLockedUrl"
  | "unlocked"
  | "hardcore"
  | "tier"
  | "provider"
  | "rarity"
  | "hidden"
  | "viewerUnlocked"
>;

export type SizeSpec = (typeof SIZE)[AchievementIconSize];
