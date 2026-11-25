import type { GameAchievementSet, GameSetAchievement } from "@/lib/api/types";
import { tickCells } from "@/lib/achievements/frame";

// Pure helpers behind the game page's Achievements section (the showcase):
// whose eyes the set is seen through, what's filtered and in which order,
// how many frames show before "Show all". No React here.

// Club: a frame counts as had when any club member holds it. Me: when the
// viewer does (only offered to a viewer with progress in the set).
export type ShowcaseLens = "club" | "me";
export type ShowcaseFilter = "all" | "unlocked" | "missing";
export type ShowcaseOrder = "set" | "rarity";

export interface ShowcaseItem {
  achievement: GameSetAchievement;
  // 1-based place in the Provider's order.
  number: number;
  had: boolean;
}

export function hadBy(achievement: GameSetAchievement, lens: ShowcaseLens): boolean {
  return lens === "me" ? achievement.viewer_unlocked : achievement.holders.length > 0;
}

export function showcaseItems(
  set: GameAchievementSet,
  lens: ShowcaseLens,
  filter: ShowcaseFilter,
  order: ShowcaseOrder,
): ShowcaseItem[] {
  const items = set.achievements.map((achievement, i) => ({
    achievement,
    number: i + 1,
    had: hadBy(achievement, lens),
  }));
  const shown = items.filter((item) =>
    filter === "all" ? true : filter === "unlocked" ? item.had : !item.had,
  );
  if (order === "rarity") {
    // Rarest first; unrated last, each run in set order.
    shown.sort((a, b) => {
      const ra = a.achievement.rarity;
      const rb = b.achievement.rarity;
      if (ra == null || rb == null) return ra == null ? (rb == null ? a.number - b.number : 1) : -1;
      return ra - rb || a.number - b.number;
    });
  }
  return shown;
}

// The strip beside the progress line: a cell per Achievement in set order.
export function showcaseCells(set: GameAchievementSet, lens: ShowcaseLens): boolean[] {
  return tickCells(set.achievements.map((a) => hadBy(a, lens)));
}

// The capped grid shows three rows; the row runs 3, 4, 6 or 9 frames as the
// section's container widens (@md, @3xl, @5xl), which keeps a frame near
// 110px: the Providers' 64px art never blows up past about twice its size. Each frame past the first
// row-set hides below the width that fits it, and "Show all" shows at the
// widths where something is hidden.
export const SHOWCASE_CAPS = [9, 12, 18, 27] as const;
// Written out whole so Tailwind finds them.
const REVEAL = ["", "hidden @md:block", "hidden @3xl:block", "hidden @5xl:block"] as const;
const SETTLE = ["", "@md:hidden", "@3xl:hidden", "@5xl:hidden"] as const;

export function capClass(index: number): string {
  const from = SHOWCASE_CAPS.findIndex((cap) => index < cap);
  return from === -1 ? "hidden" : REVEAL[from];
}

// "Show all" is needed wherever the cap at that width is under the total:
// null when every width shows everything.
export function showAllClass(total: number): string | null {
  if (total <= SHOWCASE_CAPS[0]) return null;
  const fits = SHOWCASE_CAPS.findIndex((cap) => total <= cap);
  return fits === -1 ? "" : SETTLE[fits];
}
