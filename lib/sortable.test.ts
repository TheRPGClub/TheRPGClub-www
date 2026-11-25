import { describe, expect, it } from "vitest";
import { insertionIndex, moveTo, stepFrom, zoneOf, zonesChanged } from "@/lib/sortable";

const zones = () => ({ main: [1, 2, 3], other: [4, 5], addons: [] as number[] });

describe("moveTo", () => {
  it("moves within a zone", () => {
    expect(moveTo(zones(), 1, "main", 2).main).toEqual([2, 3, 1]);
  });

  it("moves across zones, clamping the index", () => {
    const next = moveTo(zones(), 2, "addons", 9);
    expect(next.main).toEqual([1, 3]);
    expect(next.addons).toEqual([2]);
  });

  it("hands the same object back when nothing changes", () => {
    const z = zones();
    expect(moveTo(z, 2, "main", 1)).toBe(z);
    expect(moveTo(z, 99, "main", 0)).toBe(z);
  });
});

describe("insertionIndex", () => {
  const row = (top: number) => ({ left: 0, right: 100, top, bottom: top + 40 });
  const cover = (left: number, top: number) => ({ left, right: left + 90, top, bottom: top + 120 });

  it("reads rows by their middles", () => {
    const rects = [row(0), row(44), row(88)];
    expect(insertionIndex(rects, 50, 10, "rows")).toBe(0);
    expect(insertionIndex(rects, 50, 70, "rows")).toBe(2);
    expect(insertionIndex(rects, 50, 200, "rows")).toBe(3);
  });

  it("reads a grid a row at a time", () => {
    const rects = [cover(0, 0), cover(100, 0), cover(0, 130)];
    expect(insertionIndex(rects, 20, 50, "grid")).toBe(0);
    expect(insertionIndex(rects, 160, 50, "grid")).toBe(2);
    expect(insertionIndex(rects, 300, 50, "grid")).toBe(2);
    expect(insertionIndex(rects, 80, 180, "grid")).toBe(3);
  });
});

describe("stepFrom", () => {
  const order = ["main", "other", "addons"] as const;

  it("steps within a zone, then over the edge", () => {
    expect(stepFrom(zones(), order, 2, 1)).toEqual({ zone: "main", index: 2 });
    expect(stepFrom(zones(), order, 3, 1)).toEqual({ zone: "other", index: 0 });
    expect(stepFrom(zones(), order, 4, -1)).toEqual({ zone: "main", index: 3 });
  });

  it("skips a zone that refuses the item and stops at the ends", () => {
    expect(stepFrom(zones(), order, 5, 1, (_, to) => to !== "addons")).toBeNull();
    expect(stepFrom(zones(), order, 1, -1)).toBeNull();
  });
});

describe("zoneOf and zonesChanged", () => {
  it("finds the zone and spots a change", () => {
    expect(zoneOf(zones(), 5)).toBe("other");
    expect(zonesChanged(zones(), zones())).toBe(false);
    expect(zonesChanged(zones(), moveTo(zones(), 1, "other", 0))).toBe(true);
  });
});
