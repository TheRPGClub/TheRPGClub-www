import { describe, expect, it } from "vitest";

import { artFrames, categoryNames, type NewsCategory, type NewsFrame } from "@/lib/news";

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

describe("artFrames", () => {
  const frame = (n: number): NewsFrame => ({ url: `https://x.test/${n}.png`, unavailable: false });
  const six = [0, 1, 2, 3, 4, 5].map(frame);

  it("shows a working cover alone", () => {
    const art = artFrames(six.slice(0, 3), true, new Set());
    expect(art.visible.map((v) => v.i)).toEqual([0]);
    expect(art).toMatchObject({ shown: 1, extra: 0 });
  });

  it("lets the attachments take a failed cover's place", () => {
    const art = artFrames(six.slice(0, 3), true, new Set([0]));
    expect(art.visible.map((v) => v.i)).toEqual([1, 2]);
    expect(art).toMatchObject({ shown: 2, extra: 0 });
  });

  it("lays out four frames at most and counts the rest", () => {
    const art = artFrames(six, false, new Set([2]));
    expect(art.visible.map((v) => v.i)).toEqual([0, 1, 3, 4]);
    expect(art).toMatchObject({ shown: 5, extra: 1 });
  });
});
