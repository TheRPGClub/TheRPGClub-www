import { describe, expect, it } from "vitest";
import { changeUndo, changeWhen, describeChange, franchiseLayout, toRoman, withGone } from "./page";
import type { FranchiseChange, FranchiseGame, FranchisePage } from "./types";

const g = (game_id: number, title: string, release_year: number | null, extra: Partial<FranchiseGame> = {}): FranchiseGame => ({
  game_id,
  title,
  cover_url: null,
  release_year,
  mainline: false,
  source: "igdb",
  parent_game_name: null,
  ...extra,
});

function page(): FranchisePage {
  return {
    franchise_id: 1,
    name: "Final Fantasy",
    igdb_franchise_id: 9,
    created_by: null,
    name_locked: false,
    merged_into_id: null,
    viewer: { can_edit: true, can_admin: false },
    games: {
      mainline: [g(1, "Final Fantasy", 1987, { mainline: true }), g(16, "Final Fantasy XVI", 2023, { mainline: true })],
      other: [g(30, "Final Fantasy Tactics", 1997, { source: "manual" })],
      add_ons: [
        {
          parent: { game_id: 16, title: "Final Fantasy XVI", cover_url: null, release_year: 2023, in_franchise: true },
          games: [g(161, "Echoes of the Fallen", 2023), g(162, "The Rising Tide", 2024, { source: "manual" })],
        },
        {
          parent: { game_id: 77, title: "Kingdom Hearts", cover_url: null, release_year: 2002, in_franchise: false },
          games: [g(771, "Final Mix", 2002)],
        },
        { parent: null, games: [g(900, "Orphan DLC", null)] },
        { parent: null, games: [] },
      ],
    },
  };
}

describe("toRoman", () => {
  it("numbers the run", () => {
    expect([1, 4, 9, 11, 14, 16, 40, 49].map(toRoman)).toEqual(["I", "IV", "IX", "XI", "XIV", "XVI", "XL", "XLIX"]);
  });
  it("is empty for nothing to number", () => {
    expect(toRoman(0)).toBe("");
  });
});

describe("franchiseLayout", () => {
  const layout = franchiseLayout(page());

  it("numbers Mainline by release and leaves Other unnumbered", () => {
    expect(layout.mainline.map((e) => e.numeral)).toEqual(["I", "II"]);
    expect(layout.other.map((e) => e.numeral)).toEqual([null]);
  });

  it("clips Add-ons under their parent when the parent is on the page", () => {
    expect(layout.mainline[1].addOns.map((a) => a.game_id)).toEqual([161, 162]);
    expect(layout.mainline[0].addOns).toEqual([]);
  });

  it("keeps Add-ons of a parent outside the Franchise as strays, dropping empty groups", () => {
    expect(layout.strays.map((s) => s.parent?.title ?? null)).toEqual(["Kingdom Hearts", null]);
  });

  it("counts each part and the hand links", () => {
    expect(layout.counts).toEqual({ mainline: 2, other: 1, addOns: 4, manual: 2 });
  });
});

describe("withGone", () => {
  it("puts a game unlinked while editing back in its section, in release order", () => {
    const layout = franchiseLayout(page());
    const unlinked = [g(5, "Final Fantasy V", 1992, { mainline: true }), g(40, "Mobius", 2015)];
    const run = withGone(layout.mainline, unlinked, true);
    expect(run.map((e) => [e.game_id, e.numeral, e.gone])).toEqual([
      [1, "I", false],
      [5, null, true],
      [16, "II", false],
    ]);
    expect(withGone(layout.other, unlinked, false).map((e) => e.game_id)).toEqual([30, 40]);
  });

  it("drops a game once it is back on the page", () => {
    const layout = franchiseLayout(page());
    expect(withGone(layout.mainline, [g(1, "Final Fantasy", 1987, { mainline: true })], true)).toHaveLength(2);
  });
});

const change = (extra: Partial<FranchiseChange>): FranchiseChange => ({
  change_id: 1,
  franchise_id: 1,
  game_id: 5,
  game_title: "Final Fantasy XVI",
  action: "link",
  before: null,
  after: null,
  user_id: "1",
  username: "rowan",
  created_at: "2026-11-24T10:00:00Z",
  undone_at: null,
  undone_by: null,
  undone_by_username: null,
  can_undo: true,
  ...extra,
});

const words = (c: FranchiseChange) => describeChange(c).map((p) => p.text).join("");

describe("describeChange", () => {
  it("says what each action did", () => {
    expect(words(change({ action: "link" }))).toBe("linked Final Fantasy XVI");
    expect(words(change({ action: "mainline_on" }))).toBe("marked Final Fantasy XVI Mainline");
    expect(words(change({ action: "mainline_off" }))).toBe("moved Final Fantasy XVI to Spin-offs");
    expect(words(change({ action: "rename", before: { name: "FF series" }, after: { name: "Final Fantasy" } }))).toBe(
      "renamed FF series to Final Fantasy",
    );
    expect(words(change({ action: "merge", before: { name: "Final Fantasy (Square)" } }))).toBe(
      "merged Final Fantasy (Square) into this Franchise",
    );
  });

  it("bolds the names", () => {
    expect(describeChange(change({ action: "unlink" }))[1]).toEqual({ text: "Final Fantasy XVI", strong: true });
  });
});

describe("changeUndo", () => {
  it("offers Undo when the API allows it", () => {
    expect(changeUndo(change({}))).toBe("undo");
  });
  it("says merge, delete and create never undo", () => {
    expect(changeUndo(change({ action: "merge", can_undo: false }))).toBe("never");
  });
  it("offers nothing once undone or superseded", () => {
    expect(changeUndo(change({ undone_at: "2026-11-24T11:00:00Z", can_undo: false }))).toBe("none");
    expect(changeUndo(change({ can_undo: false }))).toBe("none");
  });
});

describe("changeWhen", () => {
  const now = new Date("2026-11-24T12:00:00Z");
  it("is relative in the first week, then a date", () => {
    expect(changeWhen("2026-11-24T11:59:30Z", now)).toBe("just now");
    expect(changeWhen("2026-11-24T09:00:00Z", now)).toBe("3 h ago");
    expect(changeWhen("2026-11-21T12:00:00Z", now)).toBe("3 d ago");
    expect(changeWhen("2026-11-02T12:00:00Z", now)).toBe("2 Nov 2026");
  });
});
