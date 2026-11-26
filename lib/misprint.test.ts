import { describe, expect, it } from "vitest";
import { featureView } from "@/lib/features";
import { jumpLines } from "@/lib/misprint";

describe("jumpLines", () => {
  it("gives a Visitor the front page only", () => {
    expect(jumpLines("visitor").map((j) => j.href)).toEqual(["/"]);
  });

  it("gives a Member every page when no Features are known", () => {
    expect(jumpLines("member").map((j) => j.href)).toEqual(["/dashboard", "/games", "/members", "/gotm"]);
  });

  it("leaves out a page whose Feature the Member can't open", () => {
    const features = featureView([
      { key: "game_index", state: "off", hidden: false, hideable: false },
      { key: "voting_gotm", state: "live", hidden: false, hideable: false },
    ] as never);
    expect(jumpLines("member", features).map((j) => j.href)).toEqual(["/dashboard", "/members", "/gotm"]);
  });
});
