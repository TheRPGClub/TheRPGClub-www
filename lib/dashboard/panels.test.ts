import { describe, expect, it } from "vitest";

import type { FeatureKey } from "@/lib/features";
import { CLUB_DEFAULT, PANEL_KEYS, PANELS, isPanelKey, memberPanels, placePanels, renamedPanelKey, shownPanels } from "@/lib/dashboard/panels";

const all = { shown: () => true };
const without = (...hidden: FeatureKey[]) => ({ shown: (key: FeatureKey) => !hidden.includes(key) });

describe("PANELS", () => {
  it("names every key the API knows, each under its own key", () => {
    for (const key of PANEL_KEYS) expect(PANELS[key].key).toBe(key);
  });

  it("maps each key to its panel, scope and Feature", () => {
    expect(PANELS.news).toMatchObject({ title: "Latest News", scope: "club", feature: "news_hub", place: "wide" });
    expect(PANELS.now_playing_mine).toMatchObject({ title: "Now Playing", scope: "mine", chip: true, place: "rail" });
    expect(PANELS.challenge_runs_mine).toMatchObject({ scope: "mine", chip: false, feature: "challenges" });
    expect(PANELS.birthdays).toMatchObject({ feature: null, seeAll: null, place: "rail" });
  });

  it("puts the compact panels in the rail and the rest in the main column", () => {
    const rail = PANEL_KEYS.filter((key) => PANELS[key].place === "rail");
    expect(rail).toEqual(["now_playing_mine", "challenge_runs_mine", "backlog_pick", "codex", "birthdays"]);
  });

  it("links Mine panels to the member's own pages", () => {
    expect(PANELS.completions_mine.seeAll?.("42")).toBe("/members/42/completed-games");
    expect(PANELS.backlog_pick.seeAll?.("42")).toBe("/members/42/backlogged-games/pick");
    expect(PANELS.news.seeAll?.("42")).toBe("/news");
  });

  it("gives Mine and Club versions of a subject the same ink", () => {
    expect(PANELS.now_playing_mine.ink).toBe(PANELS.now_playing_club.ink);
    expect(PANELS.completions_mine.ink).toBe(PANELS.completions_club.ink);
  });
});

describe("isPanelKey", () => {
  it("knows the panel keys only", () => {
    expect(isPanelKey("news")).toBe(true);
    expect(isPanelKey("collection")).toBe(false);
    expect(isPanelKey(3)).toBe(false);
  });
});

describe("renamedPanelKey", () => {
  it("reads the Suggestion Board's old key as the Feedback Board's", () => {
    expect(renamedPanelKey("suggestions")).toBe("feedback");
    expect(renamedPanelKey("news")).toBe("news");
  });
});

describe("shownPanels", () => {
  it("keeps the member's order", () => {
    expect(shownPanels(["codex", "news", "birthdays"], all)).toEqual(["codex", "news", "birthdays"]);
  });

  it("drops keys this website doesn't know yet, and repeats", () => {
    expect(shownPanels(["news", "collection", "news", "reviews"], all)).toEqual(["news", "reviews"]);
  });

  it("drops panels whose Feature the member can't see, but never Birthdays", () => {
    expect(shownPanels([...CLUB_DEFAULT, "birthdays"], without("now_playing", "challenges"))).toEqual([
      "news",
      "releases",
      "achievements_club",
      "birthdays",
    ]);
  });

  it("is empty for an empty list", () => {
    expect(shownPanels([], all)).toEqual([]);
  });
});

describe("placePanels", () => {
  it("splits panels into columns, each keeping its place in the member's order", () => {
    expect(placePanels(["codex", "news", "birthdays", "reviews"])).toEqual({
      wide: [
        { key: "news", order: 1 },
        { key: "reviews", order: 3 },
      ],
      rail: [
        { key: "codex", order: 0 },
        { key: "birthdays", order: 2 },
      ],
    });
  });
});

describe("memberPanels", () => {
  it("is the member's saved list, an empty one included", () => {
    expect(memberPanels(["codex"], all)).toEqual(["codex"]);
    expect(memberPanels([], all)).toEqual([]);
  });

  it("falls back to the club default when the read failed", () => {
    expect(memberPanels(null, without("news_hub"))).toEqual(CLUB_DEFAULT.filter((key) => key !== "news"));
  });
});
