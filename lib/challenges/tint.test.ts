import { describe, expect, it } from "vitest";

import { CURATED_TINTS, challengeTint, flyerTilt } from "@/lib/challenges/tint";

describe("challengeTint", () => {
  it("uses the tint the API stores", () => {
    const tint = { fill: "#123456", hi: "#abcdef" };
    expect(challengeTint({ id: 3, challenge_format: "pool", tint })).toEqual(tint);
  });

  it("falls back as the API does: holly for Secret Santa, else turning by id", () => {
    expect(challengeTint({ id: 9, challenge_format: "assignment" })).toEqual(CURATED_TINTS.holly);
    expect(challengeTint({ id: 7, challenge_format: "pool" })).toEqual(CURATED_TINTS.teal);
    expect(challengeTint({ id: 8, challenge_format: "slots" })).toEqual(CURATED_TINTS.cobalt);
    expect(challengeTint({ id: 9, challenge_format: "pool", tint: null })).toEqual(CURATED_TINTS.umber);
  });

  it("ignores a stored tint that isn't a pair of colours", () => {
    expect(
      challengeTint({
        id: 7,
        challenge_format: "pool",
        tint: { fill: "red", hi: "#fff" },
      }),
    ).toEqual(CURATED_TINTS.teal);
  });
});

describe("flyerTilt", () => {
  it("is stable and within 1.4 degrees either way", () => {
    expect(flyerTilt(5)).toBe(flyerTilt(5));
    for (let id = 1; id < 40; id++) expect(Math.abs(flyerTilt(id))).toBeLessThanOrEqual(1.4);
  });
});
