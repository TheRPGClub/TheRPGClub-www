import { describe, expect, it } from "vitest";

import {
  categoryNames,
  newsHref,
  parseNewsFilters,
  visitMarkHref,
  workingFrame,
  type NewsCategory,
  type NewsFrame,
} from "@/lib/news";

describe("categoryNames", () => {
  const nameOf = categoryNames([
    { key: "releases", name: "Releases & Dates", position: 2 },
  ] as NewsCategory[]);

  it("names a key by the API's list", () => {
    expect(nameOf("releases")).toBe("Releases & Dates");
  });

  it("reads an item with no category as General", () => {
    expect(nameOf(null)).toBe("General");
  });

  it("reads a key the list didn't load as itself, capitalised", () => {
    expect(nameOf("hardware")).toBe("Hardware");
  });
});

describe("workingFrame", () => {
  const frame = (n: number, unavailable = false): NewsFrame => ({ url: `https://x.test/${n}.png`, unavailable });

  it("takes the first frame", () => {
    expect(workingFrame([frame(0), frame(1)], new Set())).toEqual({ url: "https://x.test/0.png", i: 0 });
  });

  it("passes over failed and unavailable frames", () => {
    expect(workingFrame([frame(0), frame(1, true), frame(2)], new Set([0]))?.i).toBe(2);
  });

  it("leaves the ink panel when nothing works", () => {
    expect(workingFrame([frame(0)], new Set([0]))).toBeNull();
    expect(workingFrame([], new Set())).toBeNull();
  });
});

describe("since in the address", () => {
  const MARK = "2026-11-24T21:40:00.123456Z";

  it("keeps an ISO instant and drops anything else", () => {
    expect(parseNewsFilters({ since: MARK }).since).toBe(MARK);
    expect(parseNewsFilters({ since: "tuesday" }).since).toBeNull();
    expect(parseNewsFilters({ since: "2026-13-45T99:00:00Z" }).since).toBeNull();
    expect(parseNewsFilters({}).since).toBeNull();
  });

  it("round-trips Show all, and leaves it on a new filter", () => {
    const filters = parseNewsFilters({ q: "zelda" });
    const showAll = newsHref(filters, { since: MARK, page: 1 });
    const back = parseNewsFilters(Object.fromEntries(new URL(showAll, "https://x.test").searchParams));
    expect(back).toMatchObject({ since: MARK, q: "zelda" });
    expect(newsHref(back, { page: 2 })).toContain("since=");
    expect(newsHref(back, { q: "mana" })).toBe("/news?q=mana");
  });
});

describe("the visit marker (mark in the address)", () => {
  const MARK = "2026-11-24T21:40:00.123456Z";
  const STORED = "2026-11-25T08:00:00.000000Z";

  it("keeps an ISO instant with an offset and drops anything else", () => {
    expect(parseNewsFilters({ mark: MARK }).mark).toBe(MARK);
    expect(parseNewsFilters({ mark: "2026-11-24T21:40:00" }).mark).toBeNull();
    expect(parseNewsFilters({ mark: "soon" }).mark).toBeNull();
    expect(parseNewsFilters({}).mark).toBeNull();
  });

  it("stays through categories, search, paging and Show all, and goes on request", () => {
    const filters = parseNewsFilters({ mark: MARK });
    for (const href of [
      newsHref(filters, { categories: ["releases"] }),
      newsHref(filters, { q: "zelda" }),
      newsHref(filters, { page: 2 }),
      newsHref(filters, { since: MARK, page: 1 }),
    ]) {
      expect(new URL(href, "https://x.test").searchParams.get("mark")).toBe(MARK);
    }
    expect(newsHref(filters, { mark: null })).toBe("/news");
  });

  it("puts the stored mark in the address on a new visit", () => {
    const filters = parseNewsFilters({ q: "zelda" });
    expect(visitMarkHref(filters, undefined, STORED)).toBe(`/news?q=zelda&mark=${encodeURIComponent(STORED)}`);
  });

  it("leaves an address that already carries a good mark alone, even when the stored mark moved", () => {
    expect(visitMarkHref(parseNewsFilters({ mark: MARK }), MARK, STORED)).toBeNull();
  });

  it("leaves a first visit (no stored mark) alone", () => {
    expect(visitMarkHref(parseNewsFilters({}), undefined, null)).toBeNull();
  });

  it("drops a bad mark, putting the stored one in its place when there is one", () => {
    const bad = parseNewsFilters({ mark: "soon", page: "2" });
    expect(visitMarkHref(bad, "soon", null)).toBe("/news?page=2");
    expect(visitMarkHref(bad, "soon", STORED)).toBe(`/news?page=2&mark=${encodeURIComponent(STORED)}`);
  });
});

describe("since reuses the News Mark's instant check", () => {
  it("drops a time without an offset", () => {
    expect(parseNewsFilters({ since: "2026-11-24T21:40:00" }).since).toBeNull();
  });
});
