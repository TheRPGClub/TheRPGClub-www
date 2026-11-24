import { describe, expect, it } from "vitest";
import {
  franchisePicked,
  franchisesSection,
  franchisesView,
  stageFranchiseCreate,
  stageFranchiseLink,
  stageFranchiseMainline,
  stageFranchiseUnlink,
  unstageFranchise,
  type FranchiseCall,
  type GameFranchiseRef,
} from "./franchises";

const loaded: GameFranchiseRef[] = [
  { franchise_id: 1, name: "Compilation of Final Fantasy VII", mainline: false },
  { franchise_id: 2, name: "Final Fantasy", mainline: false },
  { franchise_id: 3, name: "Kingdom Hearts", mainline: false },
];

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

  it("linking a Franchise staged for unlink keeps it linked", () => {
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
    expect(next.map((f) => [f.name, f.mainline])).toEqual([
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
