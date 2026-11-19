import { describe, expect, it } from "vitest";

import { groupByLetter } from "@/lib/desk";

describe("groupByLetter", () => {
  it("sorts numbers by value, with # last", () => {
    const groups = groupByLetter(["10", "2", "ff", "1", "AC"], (w) => w);
    expect(groups.map((g) => [g.letter, g.items])).toEqual([
      ["A", ["AC"]],
      ["F", ["ff"]],
      ["#", ["1", "2", "10"]],
    ]);
  });
});
