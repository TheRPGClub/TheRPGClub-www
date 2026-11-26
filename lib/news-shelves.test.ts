import { describe, expect, it } from "vitest";

import type { NewsItem } from "@/lib/news";
import { leadItems, shelfScroll, shelfStep, switchedOffNames, type NewsShelf } from "@/lib/news-shelves";

const item = (id: string, posted: string): NewsItem => ({
  message_id: id,
  category_key: "releases",
  origin: "live",
  comment: null,
  posted_at: posted,
  edited_at: null,
  link: { url: `https://site.test/${id}`, title: id, site_name: "Site", description: null, image_url: null },
  images: [],
  author: { user_id: "1", name: "Vahn", member: true },
});

const shelf = (key: NewsShelf["category_key"], items: NewsItem[]): NewsShelf => ({
  category_key: key,
  name: key,
  today_count: items.length,
  items,
});

describe("leadItems", () => {
  it("takes the three newest items across every shelf, newest first", () => {
    const shelves = [
      shelf("announcements", [item("a1", "2026-11-26T10:00:00Z"), item("a2", "2026-11-26T07:00:00Z")]),
      shelf("releases", [item("r1", "2026-11-26T12:00:00Z"), item("r2", "2026-11-26T09:00:00Z")]),
      shelf("emulation", []),
    ];
    expect(leadItems(shelves).map((i) => i.message_id)).toEqual(["r1", "a1", "r2"]);
  });

  it("holds fewer when the shelves hold fewer, and none when they are empty", () => {
    expect(leadItems([shelf("releases", [item("r1", "2026-11-26T12:00:00Z")])])).toHaveLength(1);
    expect(leadItems([shelf("releases", [])])).toEqual([]);
    expect(leadItems([])).toEqual([]);
  });

  it("lists an item once even if two shelves carry it", () => {
    const twice = item("x", "2026-11-26T12:00:00Z");
    const shelves = [shelf("announcements", [twice]), shelf("releases", [twice, item("y", "2026-11-25T12:00:00Z")])];
    expect(leadItems(shelves).map((i) => i.message_id)).toEqual(["x", "y"]);
  });

  it("orders by instant, not by string, across offsets", () => {
    const shelves = [
      shelf("announcements", [item("late", "2026-11-26T12:00:00+02:00")]),
      shelf("releases", [item("early", "2026-11-26T11:00:00Z")]),
    ];
    expect(leadItems(shelves).map((i) => i.message_id)).toEqual(["early", "late"]);
  });
});

describe("switchedOffNames", () => {
  const nameOf = (key: string | null) => (key === "rumours" ? "Rumours & Leaks" : "General");

  it("names the switched-off categories in News Category order", () => {
    expect(switchedOffNames(["general", "rumours"], nameOf)).toBe("Rumours & Leaks and General");
  });

  it("joins three or more with commas and a last and", () => {
    const all = (key: string | null) => key ?? "";
    expect(switchedOffNames(["industry", "hardware", "general"], all)).toBe("industry, hardware and general");
  });

  it("is null with none switched off, and skips keys it does not know", () => {
    expect(switchedOffNames([], nameOf)).toBeNull();
    expect(switchedOffNames(["nonsense"], nameOf)).toBeNull();
  });
});

describe("shelfScroll", () => {
  it("has nothing to scroll when the row fits", () => {
    expect(shelfScroll(0, 800, 800)).toEqual({ prev: false, next: false });
  });

  it("can go on at the start and back at the end, allowing a pixel of rounding", () => {
    expect(shelfScroll(0, 2000, 800)).toEqual({ prev: false, next: true });
    expect(shelfScroll(600, 2000, 800)).toEqual({ prev: true, next: true });
    expect(shelfScroll(1199.5, 2000, 800)).toEqual({ prev: true, next: false });
  });
});

describe("shelfStep", () => {
  it("moves by the whole cards that fit in view, at least one", () => {
    expect(shelfStep(1100, 252)).toBe(4 * 252);
    expect(shelfStep(200, 252)).toBe(252);
    expect(shelfStep(1100, 0)).toBe(1100);
  });
});
