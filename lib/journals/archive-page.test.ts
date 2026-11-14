import { describe, expect, it } from "vitest";

import { archiveHref, parseArchiveQuery } from "@/lib/journals/archive-page";

describe("parseArchiveQuery", () => {
  it("reads the search, the filters, the page, the whole shelf and the pulled volume", () => {
    expect(
      parseArchiveQuery({ q: "  cave ", by: "u1", game: "12", page: "3", shelf: "all", vol: "u2" }),
    ).toEqual({ q: "cave", by: "u1", gameId: 12, page: 3, wholeShelf: true, vol: "u2" });
  });

  it("falls back to no filter, page 1 and the cut shelf", () => {
    expect(parseArchiveQuery({})).toEqual({
      q: "",
      by: null,
      gameId: null,
      page: 1,
      wholeShelf: false,
      vol: null,
    });
    expect(parseArchiveQuery({ game: "0", page: "abc", shelf: "some", by: "", vol: "" })).toMatchObject({
      gameId: null,
      page: 1,
      wholeShelf: false,
      by: null,
      vol: null,
    });
    expect(parseArchiveQuery({ game: "x", page: "-2" }).page).toBe(1);
  });

  it("takes the first of a repeated param", () => {
    expect(parseArchiveQuery({ q: ["one", "two"], game: ["5", "6"] })).toMatchObject({ q: "one", gameId: 5 });
  });
});

describe("archiveHref", () => {
  const query = parseArchiveQuery({ q: "cave", by: "u1", game: "12", page: "3", shelf: "all", vol: "u2" });

  it("keeps the page's own params (never the catalogue page) and applies the changes", () => {
    expect(archiveHref(query, { vol: "u3" })).toBe("/journals?q=cave&by=u1&game=12&shelf=all&vol=u3");
  });

  it("drops a param changed to null, and adds the hash", () => {
    expect(archiveHref(query, { q: null, by: null, page: "2" }, "#catalogue")).toBe(
      "/journals?game=12&shelf=all&vol=u2&page=2#catalogue",
    );
  });

  it("is the bare page with nothing kept", () => {
    expect(archiveHref(parseArchiveQuery({}), {})).toBe("/journals");
    expect(archiveHref(parseArchiveQuery({}), { shelf: "all" })).toBe("/journals?shelf=all");
  });
});
