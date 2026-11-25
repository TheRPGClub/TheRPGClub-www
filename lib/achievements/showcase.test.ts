import { describe, expect, it } from "vitest";
import type { GameAchievementSet, GameSetAchievement } from "@/lib/api/types";
import { capClass, showAllClass, showcaseCells, showcaseItems } from "./showcase";

const achievement = (id: number, over: Partial<GameSetAchievement> = {}): GameSetAchievement => ({
  id,
  name: `A${id}`,
  description: null,
  icon_url: null,
  icon_locked_url: null,
  hidden: false,
  tier: null,
  points: null,
  rarity: null,
  holders: [],
  viewer_unlocked: false,
  ...over,
});

const set = (achievements: GameSetAchievement[]) =>
  ({ id: 1, provider: "steam", achievements, completions: [], viewer_progress: null }) as unknown as GameAchievementSet;

describe("showcaseItems", () => {
  const s = set([
    achievement(1, { rarity: 40, viewer_unlocked: true, holders: ["a"] }),
    achievement(2, { rarity: 3, holders: ["b"] }),
    achievement(3, { rarity: null }),
    achievement(4, { rarity: 3 }),
  ]);

  it("filters by the viewer's own Unlocks in the Me lens", () => {
    expect(showcaseItems(s, "me", "unlocked", "set").map((i) => i.number)).toEqual([1]);
    expect(showcaseItems(s, "me", "missing", "set").map((i) => i.number)).toEqual([2, 3, 4]);
  });

  it("filters by any club holder in the Club lens", () => {
    expect(showcaseItems(s, "club", "unlocked", "set").map((i) => i.number)).toEqual([1, 2]);
  });

  it("orders rarest first, ties in set order, unrated last", () => {
    expect(showcaseItems(s, "club", "all", "rarity").map((i) => i.number)).toEqual([2, 4, 1, 3]);
  });

  it("lights a strip cell per Achievement the lens has", () => {
    expect(showcaseCells(s, "club")).toEqual([true, true, false, false]);
  });
});

describe("the capped grid", () => {
  it("hides frames past each width's three rows", () => {
    expect(capClass(0)).toBe("");
    expect(capClass(9)).toBe("hidden @md:block");
    expect(capClass(26)).toBe("hidden @5xl:block");
    expect(capClass(27)).toBe("hidden");
  });

  it("offers Show all only where something is hidden", () => {
    expect(showAllClass(9)).toBeNull();
    expect(showAllClass(11)).toBe("@md:hidden");
    expect(showAllClass(27)).toBe("@5xl:hidden");
    expect(showAllClass(54)).toBe("");
  });
});
