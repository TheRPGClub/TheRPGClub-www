import { describe, expect, it } from "vitest";

import { emptyDraft, type ChallengeDraft } from "@/lib/challenges/form";
import {
  goalErrors,
  leaveOut,
  moveGame,
  poolColumns,
  putBack,
  setTarget,
  sideOf,
  stepTarget,
} from "@/lib/challenges/pool-editor";

const ff1 = { game_id: 1, title: "Final Fantasy", cover_url: null };
const ff7 = { game_id: 7, title: "Final Fantasy VII", cover_url: null };
const ff11 = { game_id: 11, title: "Final Fantasy XI", cover_url: null };
const tactics = { game_id: 20, title: "Final Fantasy Tactics", cover_url: null };
const bravely = { game_id: 30, title: "Bravely Default", cover_url: null };

const draft = (over: Partial<ChallengeDraft> = {}): ChallengeDraft => ({
  ...emptyDraft(),
  sources: [{ kind: "franchise", id: 12, name: "Final Fantasy" }],
  ...over,
});

// The Franchise brings FF I, VII, XI and Tactics.
const preview = { games: [ff1, ff7, ff11, tactics], total: 4 };
const sourceIds = new Set([1, 7, 11, 20]);

describe("poolColumns", () => {
  it("puts Core first and the sources' other games in Optional", () => {
    const columns = poolColumns(draft({ core: [ff1, ff7] }), preview);
    expect(columns.core.map((g) => g.game_id)).toEqual([1, 7]);
    expect(columns.optional.map((g) => g.game_id)).toEqual([11, 20]);
    expect(columns.optionalCount).toBe(2);
  });

  it("keeps Left out games out of Optional and lists them", () => {
    const columns = poolColumns(draft({ excluded: [ff11] }), preview);
    expect(columns.optional.map((g) => g.game_id)).toEqual([1, 7, 20]);
    expect(columns.leftOut).toEqual([ff11]);
  });

  it("tags hand picks Added, new games New, and counts games past the preview's page", () => {
    const d = draft({
      optional: [bravely],
      savedOptional: [{ ...tactics, source: "franchise", new: true }],
    });
    const columns = poolColumns(d, { games: [ff1, tactics, bravely], total: 600, optionalTotal: 600 });
    expect(columns.optional.find((g) => g.game_id === 30)?.tag).toBe("added");
    expect(columns.optional.find((g) => g.game_id === 20)?.tag).toBe("new");
    expect(columns.optionalCount).toBe(600);
    expect(columns.sourceIds.has(30)).toBe(false);
  });

  it("counts games past the page from the count-only preview, so unseen Core and Left out games don't count", () => {
    // 600 source games, two of them Core and one Left out past the page.
    const columns = poolColumns(draft({ core: [ff1] }), {
      games: [ff1, ff7, tactics],
      total: 600,
      optionalTotal: 600 - 1 - 3,
    });
    expect(columns.optional.map((g) => g.game_id)).toEqual([7, 20]);
    expect(columns.optionalCount).toBe(596);
  });

  it("counts only the page's Optional Games until the count-only preview answers", () => {
    const columns = poolColumns(draft({ core: [ff1] }), { games: [ff1, ff7, tactics], total: 600 });
    expect(columns.optionalCount).toBe(2);
  });

  it("shows a hand pick before the preview answers, and the linked list's games", () => {
    const d = draft({
      sources: [],
      optional: [bravely],
      savedOptional: [{ game_id: 40, title: "Nioh", source: "list", new: false }],
    });
    const columns = poolColumns(d, null);
    expect(columns.optional.map((g) => g.game_id)).toEqual([30, 40]);
    expect(columns.sourceIds.has(40)).toBe(true);
  });
});

describe("moving games", () => {
  it("makes a source's game Core and back without a hand pick", () => {
    const core = moveGame(draft(), ff7, "core", sourceIds);
    expect(sideOf(core, 7)).toBe("core");
    const back = moveGame(core, ff7, "optional", sourceIds);
    expect(back.core).toEqual([]);
    expect(back.optional).toEqual([]);
  });

  it("keeps a game no source brings as a hand-picked Optional Game", () => {
    const core = moveGame(draft(), bravely, "core", sourceIds);
    const optional = moveGame(core, bravely, "optional", sourceIds);
    expect(optional.core).toEqual([]);
    expect(optional.optional).toEqual([bravely]);
    expect(sideOf(optional, 30)).toBe("optional");
  });

  it("adds a game once, and takes a Left out game back in", () => {
    const d = draft({ excluded: [ff11] });
    const twice = moveGame(moveGame(d, ff11, "core", sourceIds), ff11, "core", sourceIds);
    expect(twice.core).toEqual([ff11]);
    expect(twice.excluded).toEqual([]);
  });
});

describe("leaving out and putting back", () => {
  it("leaves a Core Game out, then puts it back as Optional", () => {
    const out = leaveOut(draft({ core: [ff11] }), ff11);
    expect(out.core).toEqual([]);
    expect(out.excluded).toEqual([ff11]);
    expect(sideOf(out, 11)).toBe("out");
    const back = putBack(out, ff11, sourceIds);
    expect(back.excluded).toEqual([]);
    expect(back.optional).toEqual([]);
  });

  it("puts back a game no source brings as a hand pick", () => {
    const out = leaveOut(draft({ optional: [bravely] }), bravely);
    expect(out.optional).toEqual([]);
    expect(putBack(out, bravely, sourceIds).optional).toEqual([bravely]);
  });
});

describe("the Optional target", () => {
  it("steps but never goes below 0", () => {
    expect(stepTarget(draft(), -1).optionalTarget).toBe(0);
    expect(stepTarget(stepTarget(draft(), 1), 1).optionalTarget).toBe(2);
    expect(setTarget(draft(), -4).optionalTarget).toBe(0);
    expect(setTarget(draft(), Number.NaN).optionalTarget).toBe(0);
    expect(setTarget(draft(), 2.7).optionalTarget).toBe(2);
  });

  it("is bounded by the Optional count, and a Pool needs Core or a target", () => {
    expect(goalErrors({ core: [], optionalTarget: 0 }, 4)).toEqual({
      empty: "Add a Core Game, or ask for at least 1 Optional Game.",
    });
    expect(goalErrors({ core: [ff1], optionalTarget: 0 }, 0)).toEqual({});
    expect(goalErrors({ core: [ff1], optionalTarget: 5 }, 4).target).toBe(
      "Only 4 Optional Games. Lower the target or add more.",
    );
    expect(goalErrors({ core: [ff1], optionalTarget: 4 }, 4)).toEqual({});
    expect(goalErrors({ core: [], optionalTarget: 2 }, 1).target).toBe(
      "Only 1 Optional Game. Lower the target or add more.",
    );
  });
});
