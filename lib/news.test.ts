import { describe, expect, it } from "vitest";

import { categoryNames, newsHref, parseNewsFilters, workingFrame, type NewsCategory, type NewsFrame } from "@/lib/news";

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
