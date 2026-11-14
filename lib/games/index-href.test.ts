import { describe, expect, it } from "vitest";

import { gamesIndexHref } from "@/lib/games/index-href";

describe("gamesIndexHref", () => {
  it("is bare /games with nothing to carry", () => {
    expect(gamesIndexHref({})).toBe("/games");
  });

  it("keeps page one bare and carries later pages", () => {
    expect(gamesIndexHref({ page: 1 })).toBe("/games");
    expect(gamesIndexHref({ page: 3 })).toBe("/games?page=3");
  });

  it("carries the search, then the winner filter, then the page", () => {
    expect(gamesIndexHref({ q: "zelda", winner: "nr_gotm", page: 2 })).toBe(
      "/games?q=zelda&winner=nr_gotm&page=2",
    );
  });

  it("trims the search and drops a blank one", () => {
    expect(gamesIndexHref({ q: "  chrono trigger ", winner: "gotm" })).toBe(
      "/games?q=chrono+trigger&winner=gotm",
    );
    expect(gamesIndexHref({ q: "   " })).toBe("/games");
  });
});
