import { describe, expect, it } from "vitest";

import { gamesIndexHref } from "@/lib/games/index-href";
import { anyFacet, appendFacetParams, parseFacets } from "@/lib/games/index-facets";

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

describe("game index facets", () => {
  it("carries each facet as comma-joined ids, after the winner and before the page", () => {
    expect(
      gamesIndexHref({ q: "z", winner: "gotm", facets: { genre: [12, 5], platform: [6] }, page: 2 }),
    ).toBe("/games?q=z&winner=gotm&genre=12%2C5&platform=6&page=2");
  });

  it("drops an empty facet", () => {
    expect(gamesIndexHref({ facets: { genre: [], theme: [] } })).toBe("/games");
  });

  it("parses ids from the address, skipping junk and repeats", () => {
    expect(parseFacets({ genre: "12,5,x,12", mode: "", platform: "6" })).toEqual({
      genre: [12, 5],
      platform: [6],
      theme: [],
      perspective: [],
      mode: [],
    });
  });

  it("names each facet's API parameter for the games read", () => {
    const qs = new URLSearchParams();
    appendFacetParams(qs, { genre: [12, 5], platform: [6], theme: [], perspective: [], mode: [] });
    expect(qs.toString()).toBe("genre_id%5B%5D=12&genre_id%5B%5D=5&platform_id%5B%5D=6");
  });

  it("knows when any facet is on", () => {
    expect(anyFacet(parseFacets({}))).toBe(false);
    expect(anyFacet(parseFacets({ theme: "3" }))).toBe(true);
  });
});
