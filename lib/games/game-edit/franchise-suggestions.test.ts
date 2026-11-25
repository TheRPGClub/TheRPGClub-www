import { describe, expect, it } from "vitest";
import {
  dismissedKey,
  laneSuggestions,
  matchingSuggestions,
  parseDismissed,
  suggestedFor,
  suggestionLane,
  suggestionParent,
  suggestionReason,
  suggestionWhy,
  type FranchiseSuggestion,
} from "./franchise-suggestions";

function suggestion(id: number, name: string, over: Partial<FranchiseSuggestion> = {}): FranchiseSuggestion {
  return {
    franchise: { franchise_id: id, name, igdb_franchise_id: null, created_by: null, name_locked: false, merged_into_id: null },
    reason: "series_name",
    reasons: ["series_name"],
    role: "other",
    parent_game_id: null,
    parent_title: null,
    series_games_linked: 0,
    ...over,
  };
}

const none = () => false;

describe("suggestionLane", () => {
  it("maps the API's roles onto the lanes, other being Spin-off", () => {
    expect(suggestionLane(suggestion(1, "A", { role: "mainline" }))).toBe("mainline");
    expect(suggestionLane(suggestion(1, "A", { role: "other" }))).toBe("spinoff");
    expect(suggestionLane(suggestion(1, "A", { role: "add_on" }))).toBe("addon");
  });
});

describe("suggestionReason and suggestionWhy", () => {
  it("names the strongest reason in a few words", () => {
    expect(suggestionReason(suggestion(1, "A"))).toBe("Series matches");
    expect(suggestionReason(suggestion(1, "A", { reason: "series_links", series_games_linked: 4 }))).toBe("4 Series games linked");
    expect(suggestionReason(suggestion(1, "A", { reason: "series_links", series_games_linked: 1 }))).toBe("1 Series game linked");
    expect(suggestionReason(suggestion(1, "A", { reason: "title_match" }))).toBe("Title matches");
  });

  it("says every reason in a sentence", () => {
    const s = suggestion(1, "A", { reasons: ["series_name", "series_links", "title_match"], series_games_linked: 2 });
    expect(suggestionWhy(s)).toBe(
      "Suggested because its Series has the same name, 2 games in its Series are linked to it and the title has its name.",
    );
    expect(suggestionWhy(suggestion(1, "A", { reasons: [] }))).toBe("");
  });
});

describe("suggestionParent", () => {
  it("brings the parent only for an Add-on suggestion naming one", () => {
    expect(suggestionParent(suggestion(1, "A", { role: "add_on", parent_game_id: 9, parent_title: "Base" }))).toEqual({ game_id: 9, name: "Base" });
    expect(suggestionParent(suggestion(1, "A", { role: "add_on" }))).toBeUndefined();
    expect(suggestionParent(suggestion(1, "A", { role: "mainline", parent_game_id: 9 }))).toBeUndefined();
  });
});

describe("laneSuggestions", () => {
  const list = [
    suggestion(1, "Spin", { role: "other" }),
    suggestion(2, "Main", { role: "mainline" }),
    suggestion(3, "Addon", { role: "add_on", parent_game_id: 5 }),
  ];

  it("lists the lane's likely role first, the rest in the API's order", () => {
    expect(laneSuggestions(list, "mainline", none).map((s) => s.franchise.franchise_id)).toEqual([2, 1, 3]);
    expect(laneSuggestions(list, "addon", none).map((s) => s.franchise.franchise_id)).toEqual([3, 1, 2]);
  });

  it("drops linked, staged or dismissed Franchises", () => {
    expect(laneSuggestions(list, "spinoff", (id) => id === 1).map((s) => s.franchise.franchise_id)).toEqual([2, 3]);
  });

  it("counts the lane's own for its closed Add", () => {
    expect(suggestedFor(list, "mainline", none)).toBe(1);
    expect(suggestedFor(list, "mainline", (id) => id === 2)).toBe(0);
  });
});

describe("matchingSuggestions", () => {
  const list = [suggestion(1, "Final Fantasy VII Remake"), suggestion(2, "Compilation of FF VII")];

  it("narrows by the typed name from two characters", () => {
    expect(matchingSuggestions(list, "remake").map((s) => s.franchise.franchise_id)).toEqual([1]);
    expect(matchingSuggestions(list, "r")).toHaveLength(2);
    expect(matchingSuggestions(list, "zelda")).toHaveLength(0);
  });
});

describe("dismissals", () => {
  it("keys on member and game", () => {
    expect(dismissedKey("42", 7)).not.toBe(dismissedKey("43", 7));
    expect(dismissedKey("42", 7)).not.toBe(dismissedKey("42", 8));
  });

  it("reads stored ids leniently", () => {
    expect(parseDismissed(null)).toEqual([]);
    expect(parseDismissed("not json")).toEqual([]);
    expect(parseDismissed('{"a":1}')).toEqual([]);
    expect(parseDismissed('[3, "x", -1, 4.5, 8]')).toEqual([3, 8]);
  });
});
