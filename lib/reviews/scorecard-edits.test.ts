import { describe, expect, it } from "vitest";

import type { ReviewFacets } from "./facets";
import {
  canEvenSplit,
  unpickedFacets,
  withCustomFacet,
  withLabel,
  withOrder,
  withScore,
  withWeight,
} from "./scorecard-edits";

const card = (over: Partial<ReviewFacets> = {}): ReviewFacets => ({
  template: "custom",
  order: ["story", "music"],
  scores: { story: 80, music: 60 },
  weights: { story: 50, music: 50 },
  ...over,
});

describe("withScore", () => {
  it("sets a facet's score", () => {
    expect(withScore(card(), "music", 75).scores).toEqual({ story: 80, music: 75 });
  });

  it("clears a facet's score with null, so it drops out of the average", () => {
    expect(withScore(card(), "story", null).scores).toEqual({ music: 60 });
  });
});

describe("withOrder", () => {
  it("drops a removed facet's score, name and weight, and rebalances the rest", () => {
    const next = withOrder(
      card({
        order: ["story", "music", "visuals"],
        scores: { story: 80, music: 60, visuals: 40 },
        labels: { visuals: "Looks" },
        weights: { story: 40, music: 30, visuals: 30 },
      }),
      ["story", "music"],
    );
    expect(next).toEqual({
      template: "custom",
      order: ["story", "music"],
      scores: { story: 80, music: 60 },
      weights: { story: 57, music: 43 },
    });
  });

  it("keeps the names of the facets that stay", () => {
    const next = withOrder(card({ labels: { story: "Plot" } }), ["story"]);
    expect(next.labels).toEqual({ story: "Plot" });
  });

  it("gives an added facet an even share before scaling back to the budget", () => {
    const next = withOrder(card(), ["story", "music", "visuals"]);
    expect(next.weights).toEqual({ story: 38, music: 37, visuals: 25 });
  });

  it("gives an unweighted card the even split", () => {
    const next = withOrder(card({ weights: undefined }), ["story", "music", "visuals"]);
    expect(next.weights).toEqual({ story: 34, music: 33, visuals: 33 });
  });

  it("leaves an emptied card with no weights", () => {
    const next = withOrder(card(), []);
    expect(next).toEqual({ template: "custom", order: [], scores: {} });
  });
});

describe("withWeight", () => {
  it("sets a facet's share without touching the others", () => {
    expect(withWeight(card(), "story", 70).weights).toEqual({ story: 70, music: 50 });
  });

  it("leaves a card with no weights alone", () => {
    const unweighted = card({ weights: undefined });
    expect(withWeight(unweighted, "story", 70)).toBe(unweighted);
  });
});

describe("withLabel", () => {
  it("renames a facet", () => {
    expect(withLabel(card(), "story", "Plot").labels).toEqual({ story: "Plot" });
  });

  it("cuts a name at the label limit", () => {
    expect(withLabel(card(), "story", "x".repeat(50)).labels?.story).toBe("x".repeat(40));
  });

  it("drops the override for a blank name or the catalogue's own name", () => {
    const named = card({ labels: { story: "Plot", music: "Tunes" } });
    expect(withLabel(named, "story", "   ").labels).toEqual({ music: "Tunes" });
    expect(withLabel(named, "music", "Music & Sound").labels).toEqual({ story: "Plot" });
  });

  it("removes the labels field once the last override goes", () => {
    const next = withLabel(card({ labels: { story: "Plot" } }), "story", "Story");
    expect(next).not.toHaveProperty("labels");
  });
});

describe("withCustomFacet", () => {
  it("adds a named custom row at the end and says which key it took", () => {
    const { card: next, key } = withCustomFacet(
      card({ order: ["story", "custom:2"], scores: {}, weights: { story: 50, "custom:2": 50 } }),
    );
    expect(key).toBe("custom:3");
    expect(next.order).toEqual(["story", "custom:2", "custom:3"]);
    expect(next.labels).toEqual({ "custom:3": "New category" });
    expect(next.weights).toEqual({ story: 38, "custom:2": 37, "custom:3": 25 });
  });
});

describe("canEvenSplit", () => {
  it("is false on a card already on its even split", () => {
    expect(canEvenSplit(card())).toBe(false);
  });

  it("is true once the split moves off even", () => {
    expect(canEvenSplit(card({ weights: { story: 60, music: 40 } }))).toBe(true);
  });

  it("is true while the shares don't add up", () => {
    expect(canEvenSplit(card({ weights: { story: 50, music: 40 } }))).toBe(true);
  });
});

describe("unpickedFacets", () => {
  it("lists the catalogue facets not on the card, in catalogue order", () => {
    const keys = unpickedFacets(card({ order: ["story", "characters", "combat"] })).map(
      (facet) => facet.key,
    );
    expect(keys.slice(0, 3)).toEqual(["world", "music", "visuals"]);
    expect(keys).not.toContain("story");
  });

  it("lists the whole catalogue with no card", () => {
    expect(unpickedFacets(null).length).toBeGreaterThan(6);
  });
});
