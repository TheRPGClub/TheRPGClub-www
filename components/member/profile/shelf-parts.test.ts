import { describe, expect, it } from "vitest";
import { spineLift } from "./shelf-parts";

describe("spineLift", () => {
  it("shows the hours, or No time for a game never played", () => {
    expect(spineLift(5280, "Completed Sep 26")).toEqual({ hours: "88 h", sub: "Completed Sep 26" });
    expect(spineLift(null, "Added Sep 25")).toEqual({ hours: "No time", sub: "Added Sep 25" });
    expect(spineLift(0, null)).toEqual({ hours: "No time", sub: null });
  });

  it("is undefined when the API sends no Playtime field (an older API)", () => {
    expect(spineLift(undefined, "Completed Sep 26")).toBeUndefined();
  });
});
