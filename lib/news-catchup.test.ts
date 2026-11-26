import { describe, expect, it } from "vitest";

import type { NewsItem } from "@/lib/news";
import {
  agoLabel,
  inkSegments,
  markOf,
  newestPosted,
  packTiles,
  rowWhen,
  sinceLabel,
  siteInitial,
  splitCatchup,
  tileSize,
  type TilePlace,
  type TileSize,
} from "@/lib/news-catchup";

const item = (n: number, over: Partial<NewsItem> = {}): NewsItem => ({
  message_id: String(n),
  category_key: "releases",
  origin: "live",
  comment: null,
  posted_at: `2026-11-26T${String(20 - n).padStart(2, "0")}:00:00.000Z`,
  edited_at: null,
  link: { url: `https://site.test/${n}`, title: `Item ${n}`, site_name: "Site", description: null, image_url: null },
  images: [],
  author: { user_id: "1", name: "Vahn", member: true },
  ...over,
});
const items = (count: number) => Array.from({ length: count }, (_, n) => item(n));
const MARK = "2026-11-24T21:40:00.123456Z";

describe("markOf", () => {
  it("reads a mark only with its counts", () => {
    expect(markOf({ news_mark: MARK, new_count: 3 })).toBe(MARK);
    expect(markOf({ news_mark: MARK })).toBeNull();
    expect(markOf({ news_mark: null, new_count: 0 })).toBeNull();
    expect(markOf(null)).toBeNull();
  });
});

describe("splitCatchup", () => {
  it("makes the newest new item the hero and the rest of the new the mosaic", () => {
    const c = splitCatchup({ news_mark: MARK, new_count: 4 }, items(10), [item(20)], 1);
    expect(c.state).toBe("new");
    expect(c.hero?.message_id).toBe("0");
    expect(c.mosaic.map((i) => i.message_id)).toEqual(["1", "2", "3"]);
    expect(c.moreNew).toBe(0);
    expect(c.seen.map((i) => i.message_id)).toEqual(["20"]);
  });

  it("counts the new items past the mosaic", () => {
    const c = splitCatchup({ news_mark: MARK, new_count: 23 }, items(10), [], 1);
    expect(c.mosaic).toHaveLength(9);
    expect(c.moreNew).toBe(13);
  });

  it("keeps the newest item as the hero when nothing is new, once", () => {
    const c = splitCatchup({ news_mark: MARK, new_count: 0 }, items(10), items(3), 1);
    expect(c.state).toBe("caught_up");
    expect(c.hero?.message_id).toBe("0");
    expect(c.seen.map((i) => i.message_id)).toEqual(["1", "2"]);
  });

  it("reads a missing mark, or an API without counts, as a first visit", () => {
    expect(splitCatchup({ news_mark: null, new_count: 0 }, items(3), items(3), 1).state).toBe("first_visit");
    const old = splitCatchup({}, items(3), items(3), 1);
    expect(old.state).toBe("first_visit");
    expect(old.newCount).toBe(0);
  });

  it("holds only Seen rows on a later page", () => {
    const c = splitCatchup({ news_mark: MARK, new_count: 4 }, items(10), items(3), 2);
    expect(c.hero).toBeNull();
    expect(c.mosaic).toEqual([]);
    expect(c.seen).toHaveLength(3);
  });
});

describe("inkSegments", () => {
  it("lists categories with new items in category order, Rumours dashed", () => {
    const segs = inkSegments({ rumours: 3, announcements: 5, industry: 0 }, () => "Announcements & Trailers");
    expect(segs.map((s) => [s.key, s.count, s.dashed])).toEqual([
      ["announcements", 5, false],
      ["rumours", 3, true],
    ]);
    expect(segs[0].name).toBe("Announcements");
  });
});

describe("tileSize", () => {
  const art = { url: "https://x.test/a.png", unavailable: false };
  it("sizes a tile by what it carries", () => {
    expect(tileSize(item(0, { link: { ...item(0).link!, image_url: art.url, description: "More" } }))).toBe("large");
    expect(tileSize(item(0, { link: { ...item(0).link!, image_url: art.url } }))).toBe("normal");
    expect(tileSize(item(0, { link: null, images: [art], comment: "Look" }))).toBe("normal");
    expect(tileSize(item(0, { comment: "Grain of salt" }))).toBe("quote");
    expect(tileSize(item(0))).toBe("panel");
    expect(tileSize(item(0, { images: [{ url: null, unavailable: true }] }))).toBe("panel");
  });
});

describe("siteInitial", () => {
  it("takes the first letter or digit", () => {
    expect(siteInitial("bloomberg.com")).toBe("B");
    expect(siteInitial("(9to5)")).toBe("9");
    expect(siteInitial("…")).toBe("#");
  });
});

describe("packTiles", () => {
  const cells = (places: TilePlace[]) => {
    const seen = new Set<string>();
    for (const p of places)
      for (let y = p.row; y < p.row + p.h; y += 1)
        for (let x = p.col; x < p.col + p.w; x += 1) {
          const key = `${y}:${x}`;
          expect(seen.has(key)).toBe(false);
          seen.add(key);
        }
    return seen;
  };
  const holeless = (sizes: TileSize[], cols: number) => {
    const places = packTiles(sizes, cols);
    const rows = Math.max(...places.map((p) => p.row + p.h - 1));
    expect(cells(places).size).toBe(rows * cols);
    return places;
  };

  it("lays out the sketch's mosaic in reading order", () => {
    const places = holeless(["large", "normal", "quote", "panel", "quote", "normal", "panel"], 6);
    expect(places[0]).toEqual({ row: 1, col: 1, w: 2, h: 2 });
    expect(places[1]).toEqual({ row: 1, col: 3, w: 2, h: 1 });
    expect(places[5]).toEqual({ row: 2, col: 4, w: 2, h: 1 });
  });

  it("never leaves a hole, whatever the mix", () => {
    const kinds: TileSize[] = ["large", "normal", "quote", "panel"];
    for (let seed = 1; seed < 200; seed += 1) {
      const sizes = Array.from({ length: (seed % 9) + 1 }, (_, i) => kinds[(seed * (i + 3) * 7) % 4]);
      holeless(sizes, 6);
      holeless(sizes, 2);
    }
  });

  it("keeps one column on a phone", () => {
    expect(packTiles(["large", "quote"], 1)).toEqual([
      { row: 1, col: 1, w: 1, h: 1 },
      { row: 2, col: 1, w: 1, h: 1 },
    ]);
  });
});

describe("time labels", () => {
  const now = new Date("2026-11-26T12:00:00Z");
  it("says since when, in UTC", () => {
    expect(sinceLabel("2026-11-26T09:05:00Z", now)).toBe("today, 09:05");
    expect(sinceLabel("2026-11-25T21:40:00Z", now)).toBe("yesterday, 21:40");
    expect(sinceLabel("2026-11-24T21:40:00.123456Z", now)).toBe("Tuesday, 21:40");
    expect(sinceLabel("2026-11-02T08:00:00Z", now)).toBe("2 Nov, 08:00");
    expect(sinceLabel("2025-11-02T08:00:00Z", now)).toBe("2 Nov 2025, 08:00");
  });

  it("ages a tile", () => {
    expect(agoLabel("2026-11-26T11:59:30Z", now)).toBe("now");
    expect(agoLabel("2026-11-26T11:48:00Z", now)).toBe("12 min ago");
    expect(agoLabel("2026-11-26T09:00:00Z", now)).toBe("3 h ago");
    expect(agoLabel("2026-11-24T21:40:00Z", now)).toBe("Tue 21:40");
    expect(agoLabel("2026-11-02T08:00:00Z", now)).toBe("2 Nov");
  });

  it("dates a Seen row", () => {
    expect(rowWhen("2026-11-26T08:15:00Z", now)).toBe("08:15");
    expect(rowWhen("2026-11-24T20:12:00Z", now)).toBe("Tue 20:12");
    expect(rowWhen("2026-10-01T20:12:00Z", now)).toBe("1 Oct");
  });
});

describe("newestPosted", () => {
  const item = (id: string, posted_at: string) => ({ message_id: id, posted_at }) as NewsItem;

  it("is the most recently posted, skipping missing reads", () => {
    const a = item("a", "2026-11-26T09:00:00.000Z");
    const b = item("b", "2026-11-26T10:00:00.000Z");
    expect(newestPosted([a, undefined, b, null])).toBe(b);
    expect(newestPosted([undefined, null])).toBeNull();
  });
});
