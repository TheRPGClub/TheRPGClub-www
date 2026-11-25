import {
  HIGHLIGHT_LABEL,
  PROVIDER_LABEL,
  TIER_LABEL,
  displayRarity,
  formatRarity,
  type AchievementView,
} from "@/lib/achievements";
import type { AchievementHighlightKind } from "@/lib/api/types";

// The facts an Achievement frame's hover card states, in each Provider's own
// terms: a PlayStation trophy's grade, a RetroAchievements Achievement's
// points, plain Steam. A Completion or Mastery Unlock names itself first (a
// Platinum already does, as its grade).
export function frameFacts(
  view: Pick<AchievementView, "provider" | "tier" | "points">,
  highlight: AchievementHighlightKind | null = null,
): string {
  const parts: string[] = [];
  if (highlight === "completion" || highlight === "mastery") {
    parts.push(HIGHLIGHT_LABEL[highlight]);
  }
  if (view.provider === "psn" && view.tier) {
    parts.push(`${TIER_LABEL[view.tier]} trophy`);
  }
  if (view.provider === "retroachievements" && view.points != null && view.points > 0) {
    parts.push(`${view.points} ${view.points === 1 ? "point" : "points"}`);
  }
  parts.push(PROVIDER_LABEL[view.provider]);
  return parts.join(" · ");
}

// "15.2% of players", "6.2% of players (hardcore)", or null without one.
export function frameRarity(
  view: Pick<AchievementView, "provider" | "hardcore" | "rarity" | "rarityHardcore">,
): string | null {
  const { rarity, hardcore } = displayRarity(view);
  if (rarity == null) return null;
  return `${formatRarity(rarity)} of players${hardcore ? " (hardcore)" : ""}`;
}

// A segment strip's cells: `on` per cell. Up to `max` Achievements get a
// cell each in set order; a longer set folds into `max` cells, each lit by
// the share of the set it stands for (so the strip never outgrows its row).
export function tickCells(owned: boolean[], max = 60): boolean[] {
  if (owned.length <= max) return owned;
  const per = owned.length / max;
  return Array.from({ length: max }, (_, i) => {
    const from = Math.floor(i * per);
    const to = Math.max(from + 1, Math.floor((i + 1) * per));
    const slice = owned.slice(from, to);
    return slice.filter(Boolean).length * 2 >= slice.length;
  });
}

// A strip for a count alone (earned of total), the earned cells first.
export function countCells(earned: number, total: number, max = 60): boolean[] {
  if (total <= 0) return [];
  const cells = Math.min(total, max);
  const lit = Math.round((earned / total) * cells);
  return Array.from({ length: cells }, (_, i) => i < lit);
}
