import { describe, expect, it } from "vitest";

import { reelIndex, reelStep } from "./reel-selection";

const removedOf = (ids: number[]) => (i: number) => ids.includes(i);

describe("reelIndex", () => {
  it("keeps the selected completion while it is there", () => {
    expect(reelIndex(2, 4, removedOf([]))).toBe(2);
  });

  it("moves off a removed completion to the next one, wrapping", () => {
    expect(reelIndex(2, 4, removedOf([2]))).toBe(3);
    expect(reelIndex(3, 4, removedOf([3]))).toBe(0);
  });

  it("is -1 when every completion is removed", () => {
    expect(reelIndex(0, 2, removedOf([0, 1]))).toBe(-1);
    expect(reelIndex(0, 0, removedOf([]))).toBe(-1);
  });
});

describe("reelStep", () => {
  it("steps over removed completions both ways", () => {
    expect(reelStep(0, 1, 4, removedOf([1]))).toBe(2);
    expect(reelStep(0, -1, 4, removedOf([3]))).toBe(2);
  });
});
