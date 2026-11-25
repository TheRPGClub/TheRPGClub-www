import { describe, expect, it } from "vitest";
import {
  franchiseLanes,
  franchisePicked,
  moveFranchise,
  stageFranchiseInLane,
  stageFranchiseParent,
  unstageFranchiseParent,
  franchisesSection,
  franchisesView,
  stageFranchiseCreate,
  stageFranchiseLink,
  stageFranchiseMainline,
  stageFranchiseUnlink,
  unstageFranchise,
  type FranchiseCall,
  type GameFranchises,
} from "./franchises";

const loaded: GameFranchises = {
  franchises: [
    { franchise_id: 1, name: "Compilation of Final Fantasy VII", mainline: false },
    { franchise_id: 2, name: "Final Fantasy", mainline: false },
    { franchise_id: 3, name: "Kingdom Hearts", mainline: false },
  ],
  parent: null,
};

describe("staging Franchises", () => {
  it("stages Mainline, a link, a new Franchise and an unlink, as 7A shows", () => {
    let s = stageFranchiseMainline(loaded, undefined, "f1", true);
    s = stageFranchiseLink(loaded, s, { franchise_id: 9, name: "Midgar Chronicles" });
    s = stageFranchiseCreate(s, "Midgar");
    s = stageFranchiseUnlink(loaded, s, 3);
    expect(franchisesSection.changes(loaded, s!)).toBe(4);
    expect(franchisesView(loaded, s).map((r) => [r.name, r.mainline, r.mark])).toEqual([
      ["Compilation of Final Fantasy VII", true, "edited"],
      ["Final Fantasy", false, null],
      ["Kingdom Hearts", false, "removing"],
      ["Midgar Chronicles", false, "added"],
      ["Midgar", false, "added"],
    ]);
  });

  it("drops a Mainline change set back to what was loaded", () => {
    const s = stageFranchiseMainline(loaded, stageFranchiseMainline(loaded, undefined, "f1", true), "f1", false);
    expect(s).toBeUndefined();
  });

  it("sets Mainline on a staged link and a staged new Franchise", () => {
    let s = stageFranchiseLink(loaded, undefined, { franchise_id: 9, name: "Midgar Chronicles" });
    s = stageFranchiseCreate(s, "Midgar");
    s = stageFranchiseMainline(loaded, s, "f9", true);
    s = stageFranchiseMainline(loaded, s, "new:Midgar", true);
    expect(franchisesView(loaded, s).filter((r) => r.mark === "added").map((r) => r.mainline)).toEqual([true, true]);
  });

  it("linking a Franchise staged for unlink keeps it linked, in the lane's role", () => {
    const s = stageFranchiseUnlink(loaded, undefined, 3);
    expect(stageFranchiseLink(loaded, s, { franchise_id: 3, name: "Kingdom Hearts" }, true)?.mainline).toEqual([
      { franchise_id: 3, mainline: true },
    ]);
  });

  it("linking a Franchise staged for unlink as it was drops the stage", () => {
    const s = stageFranchiseUnlink(loaded, undefined, 3);
    expect(stageFranchiseLink(loaded, s, { franchise_id: 3, name: "Kingdom Hearts" })).toBeUndefined();
  });

  it("ignores a second create of the same name", () => {
    const s = stageFranchiseCreate(undefined, "Midgar");
    expect(stageFranchiseCreate(s, " midgar ")).toBe(s);
  });

  it("undoes one row", () => {
    let s = stageFranchiseUnlink(loaded, undefined, 3);
    s = stageFranchiseCreate(s, "Midgar");
    s = unstageFranchise(s, "f3");
    expect(franchisesView(loaded, s).map((r) => r.mark)).toEqual([null, null, null, "added"]);
    expect(unstageFranchise(s, "new:Midgar")).toBeUndefined();
  });

  it("marks search results already on the game", () => {
    const s = stageFranchiseUnlink(loaded, stageFranchiseLink(loaded, undefined, { franchise_id: 9, name: "M" }), 2);
    expect([1, 2, 9, 10].map((id) => franchisePicked(loaded, s, id))).toEqual([true, false, true, false]);
  });
});

describe("franchisesSection", () => {
  const stage = {
    link: [{ franchise_id: 9, name: "Midgar Chronicles", mainline: true }],
    create: [{ name: "Midgar", mainline: false }],
    unlink: [3],
    mainline: [{ franchise_id: 1, mainline: true }],
  };

  it("plans creates, links, Mainline, then unlinks", () => {
    expect(franchisesSection.plan(loaded, stage).map((c) => c.kind)).toEqual([
      "franchise.create",
      "franchise.link",
      "franchise.mainline",
      "franchise.unlink",
    ]);
  });

  it("applies the stage to the record", () => {
    const next = franchisesSection.apply(loaded, stage);
    expect(next.parent).toBeNull();
    expect(next.franchises.map((f) => [f.name, f.mainline])).toEqual([
      ["Compilation of Final Fantasy VII", true],
      ["Final Fantasy", false],
      ["Midgar", false],
      ["Midgar Chronicles", true],
    ]);
  });

  it("keeps only what didn't save", () => {
    const saved: FranchiseCall[] = [
      { kind: "franchise.create", name: "Midgar", mainline: false },
      { kind: "franchise.link", franchiseId: 9, mainline: true },
    ];
    expect(franchisesSection.remaining!(loaded, stage, saved)).toEqual({
      create: [],
      link: [],
      unlink: [3],
      mainline: [{ franchise_id: 1, mainline: true }],
    });
  });

  it("needs the Regulars-or-staff gate", () => {
    expect(franchisesSection.access).toBe("threads");
  });
});

const ff7r: GameFranchises = {
  franchises: [
    { franchise_id: 1, name: "Compilation of Final Fantasy VII", mainline: true },
    { franchise_id: 2, name: "Final Fantasy", mainline: false },
  ],
  parent: null,
};
const dlc: GameFranchises = { ...ff7r, parent: { game_id: null, name: "Final Fantasy VII Rebirth" } };
const rebirth = { game_id: 77, name: "Final Fantasy VII Rebirth" };
const names = (rows: { name: string }[]) => rows.map((r) => r.name);

describe("role lanes", () => {
  it("puts each Franchise in Mainline in or Spin-off of by its Mainline mark", () => {
    const lanes = franchiseLanes(ff7r, undefined);
    expect(names(lanes.mainline)).toEqual(["Compilation of Final Fantasy VII"]);
    expect(names(lanes.spinoff)).toEqual(["Final Fantasy"]);
    expect(lanes.addon).toEqual([]);
    expect(lanes.parent).toBeNull();
  });

  it("puts every Franchise of a game with a parent in Add-on of", () => {
    const lanes = franchiseLanes(dlc, undefined);
    expect(names(lanes.addon)).toEqual(["Compilation of Final Fantasy VII", "Final Fantasy"]);
    expect(lanes.mainline).toEqual([]);
    expect(lanes.parent).toEqual({ name: "Final Fantasy VII Rebirth", mark: null });
  });

  it("adds in a lane's role", () => {
    let s = stageFranchiseInLane(ff7r, undefined, { franchise_id: 9, name: "Midgar" }, "mainline");
    s = stageFranchiseInLane(ff7r, s, { name: "Remake" }, "spinoff");
    const lanes = franchiseLanes(ff7r, s);
    expect(names(lanes.mainline)).toEqual(["Compilation of Final Fantasy VII", "Midgar"]);
    expect(names(lanes.spinoff)).toEqual(["Final Fantasy", "Remake"]);
  });

  it("adding in Add-on of sets the parent, and moves every Franchise there", () => {
    const s = stageFranchiseInLane(ff7r, undefined, { franchise_id: 9, name: "Midgar" }, "addon", rebirth);
    const lanes = franchiseLanes(ff7r, s);
    expect(names(lanes.addon)).toEqual(["Compilation of Final Fantasy VII", "Final Fantasy", "Midgar"]);
    expect(lanes.parent).toEqual({ name: "Final Fantasy VII Rebirth", mark: "added" });
    expect(franchisesSection.changes(ff7r, s!)).toBe(2);
  });

  it("adding in Add-on of when the game has a parent only links", () => {
    const s = stageFranchiseInLane(dlc, undefined, { franchise_id: 9, name: "Midgar" }, "addon");
    expect(s?.parent).toBeUndefined();
    expect(franchiseLanes(dlc, s).addon.map((r) => r.mark)).toEqual([null, null, "added"]);
  });

  it("adding an Add-on in Mainline in clears the parent", () => {
    const s = stageFranchiseInLane(dlc, undefined, { franchise_id: 9, name: "Midgar" }, "mainline");
    const lanes = franchiseLanes(dlc, s);
    expect(lanes.parent).toEqual({ name: "Final Fantasy VII Rebirth", mark: "removing" });
    expect(names(lanes.mainline)).toEqual(["Compilation of Final Fantasy VII", "Midgar"]);
  });

  it("moves a Franchise between Mainline in and Spin-off of", () => {
    const s = moveFranchise(ff7r, undefined, "f2", "mainline");
    expect(franchiseLanes(ff7r, s).mainline.map((r) => [r.name, r.mark])).toEqual([
      ["Compilation of Final Fantasy VII", null],
      ["Final Fantasy", "edited"],
    ]);
    expect(moveFranchise(ff7r, s, "f2", "spinoff")).toBeUndefined();
  });

  it("moves into Add-on of with a parent, and out again by clearing it", () => {
    expect(moveFranchise(ff7r, undefined, "f2", "addon")).toBeUndefined();
    const s = moveFranchise(ff7r, undefined, "f2", "addon", rebirth);
    expect(s?.parent).toEqual(rebirth);
    const out = moveFranchise(dlc, undefined, "f2", "mainline");
    expect(out?.parent).toBeNull();
    expect(names(franchiseLanes(dlc, out).mainline)).toEqual(["Compilation of Final Fantasy VII", "Final Fantasy"]);
  });

  it("undoes a parent change", () => {
    const s = stageFranchiseParent(ff7r, undefined, rebirth);
    expect(unstageFranchiseParent(s)).toBeUndefined();
    expect(stageFranchiseParent(dlc, undefined, null)?.parent).toBeNull();
    expect(stageFranchiseParent(ff7r, undefined, null)).toBeUndefined();
  });
});

describe("saving the parent", () => {
  it("sends it through a loaded Franchise, before unlinks", () => {
    let s = stageFranchiseParent(ff7r, undefined, rebirth);
    s = stageFranchiseUnlink(ff7r, s, 1);
    expect(franchisesSection.plan(ff7r, s!)).toEqual([
      { kind: "franchise.parent", franchiseId: 1, parentGameId: 77 },
      { kind: "franchise.unlink", franchiseId: 1 },
    ]);
    expect(franchisesSection.apply(ff7r, s!).parent).toEqual(rebirth);
  });

  it("clears it with null", () => {
    const s = stageFranchiseParent(dlc, undefined, null);
    expect(franchisesSection.plan(dlc, s!)).toEqual([{ kind: "franchise.parent", franchiseId: 1, parentGameId: null }]);
  });

  it("rides on the first new link, or the first new Franchise, when the game has none", () => {
    const none: GameFranchises = { franchises: [], parent: null };
    let s = stageFranchiseInLane(none, undefined, { name: "Midgar" }, "addon", rebirth);
    expect(franchisesSection.plan(none, s!)).toEqual([
      { kind: "franchise.create", name: "Midgar", mainline: false, parentGameId: 77 },
    ]);
    s = stageFranchiseInLane(none, s, { franchise_id: 9, name: "Final Fantasy" }, "addon");
    expect(franchisesSection.plan(none, s!).map((c) => ("parentGameId" in c ? c.parentGameId : undefined))).toEqual([
      undefined,
      77,
    ]);
  });

  it("refuses a parent with no Franchise to carry it", () => {
    const none: GameFranchises = { franchises: [], parent: null };
    const s = stageFranchiseParent(none, undefined, rebirth)!;
    expect(franchisesSection.check!(s, none)).toMatch(/Link the game/);
  });

  it("keeps the parent staged until its call saves", () => {
    let s = stageFranchiseParent(ff7r, undefined, rebirth);
    s = stageFranchiseLink(ff7r, s, { franchise_id: 9, name: "Midgar" });
    const link: FranchiseCall = { kind: "franchise.link", franchiseId: 9, mainline: false };
    expect(franchisesSection.remaining!(ff7r, s!, [link]).parent).toEqual(rebirth);
    const parent: FranchiseCall = { kind: "franchise.parent", franchiseId: 1, parentGameId: 77 };
    expect(franchisesSection.remaining!(ff7r, s!, [link, parent]).parent).toBeUndefined();
  });
});
