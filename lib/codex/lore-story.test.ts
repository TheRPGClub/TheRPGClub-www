import { describe, expect, it } from "vitest";
import type { Value } from "platejs";

import { dateFields, dateStamp, spineDate } from "./lore-date";
import { paragraphBefore, resolvePending, spreadLayout, storyImageIds, storyOpening } from "./lore-story";
import { shelfScale, spineBinding, spineBindings, spineHeight, spineWidth } from "./shelf";

const p = (text: string) => ({ type: "p", children: [{ text }] });
const img = (id: number, caption?: string) => ({ type: "img", id, url: `https://cdn/${id}`, caption, children: [{ text: "" }] });
const pending = (key: string) => ({ type: "img", pendingKey: key, url: "blob:x", children: [{ text: "" }] });
const images = [1, 2, 3].map((id) => ({ id, url: `https://cdn/${id}`, position: id }));

describe("story images", () => {
  const story = [p("one"), img(1), p("two"), { type: "h2", children: [{ text: "h" }] }, pending("k"), p("three")] as Value;

  it("says which paragraph an image follows", () => {
    expect(paragraphBefore(story, { id: 1 })).toBe(1);
    expect(paragraphBefore(story, { pendingKey: "k" })).toBe(3);
    expect(paragraphBefore(story, { id: 9 })).toBeNull();
  });

  it("swaps pending images for their uploads", () => {
    const out = resolvePending(story, new Map([["k", { id: 5, url: "https://cdn/5" }]]));
    expect(out[4]).toEqual({ type: "img", id: 5, url: "https://cdn/5", children: [{ text: "" }] });
    expect(storyImageIds(out)).toEqual([1, 5]);
  });
});

describe("spreadLayout", () => {
  it("tapes each image beside the block before it, alternating margins", () => {
    const blocks = spreadLayout([img(3), p("a"), img(1, "23:12 The command."), p("b"), p("c"), img(2), img(9)], images);
    expect(blocks.map((b) => [b.row, b.side, b.photos.map((ph) => ph.id)])).toEqual([
      [1, "right", [3, 1]],
      [2, "right", []],
      [3, "left", [2]],
    ]);
    expect(blocks[0].opening).toBe(true);
    expect(blocks[2].last).toBe(true);
    expect(blocks[0].photos[1]).toMatchObject({ caption: "23:12 The command.", tilt: 2.5 });
  });

  it("keeps photos out of the pull quote's margin", () => {
    const quote = { type: "blockquote", children: [p("q")] };
    const blocks = spreadLayout([p("a"), img(1), quote], images);
    expect(blocks[0].side).toBe("left");
  });
});

describe("storyOpening", () => {
  it("takes the first paragraph, mentions as tokens, cut at whole sentences", () => {
    const value = [
      { type: "h1", children: [{ text: "Head" }] },
      { type: "p", children: [{ text: "Hi " }, { type: "mention", userId: "42", value: "Mog", children: [{ text: "" }] }, { text: ". Second one here." }] },
    ];
    expect(storyOpening(value)).toBe("Hi <@42>. Second one here.");
    expect(storyOpening(value, 12)).toBe("Hi <@42>.");
    expect(storyOpening([p("A very long first sentence without an end")], 20)).toBe("A very long first…");
    expect(storyOpening(null)).toBe("");
  });
});

describe("Lore dates", () => {
  it("stamps and labels a date at its precision", () => {
    expect(dateStamp("2020-08-12", "day")).toEqual({ lines: ["12 Aug", "2020"], note: "The night of" });
    expect(dateStamp("2019-03-01", "month")).toEqual({ lines: ["Mar", "2019"], note: "That month" });
    expect(dateStamp("2021-01-01", "year")).toEqual({ lines: ["2021"], note: "That year" });
    expect(dateStamp(null, null)).toBeNull();
    expect(spineDate("2020-08-12", "day")).toBe("12 Aug 2020");
    expect(spineDate("2019-03-01", "month")).toBe("March 2019");
    expect(spineDate(null, null)).toBe("Undated");
  });

  it("turns the Date card into API fields", () => {
    const base = { day: "31", month: 2, year: "2020" };
    expect(dateFields({ ...base, choice: "none" })).toEqual({ occurred_on: null, date_precision: null });
    expect(dateFields({ ...base, choice: "year" })).toEqual({ occurred_on: "2020-01-01", date_precision: "year" });
    expect(dateFields({ ...base, choice: "month" })).toEqual({ occurred_on: "2020-02-01", date_precision: "month" });
    expect(dateFields({ ...base, choice: "day" })).toEqual({ error: "February 2020 has no day 31." });
    expect(dateFields({ ...base, day: "29", choice: "day" })).toEqual({ occurred_on: "2020-02-29", date_precision: "day" });
    expect(dateFields({ ...base, year: "20", choice: "year" })).toEqual({ error: "Give the year as four digits." });
  });
});

describe("the shelf", () => {
  it("sizes spines by story length and keeps their look stable", () => {
    expect(spineWidth(0)).toBe(74);
    expect(spineWidth(2000)).toBe(93);
    expect(spineWidth(9000)).toBe(112);
    for (const id of [1, 2, 3, 99]) {
      expect(spineHeight(id)).toBeGreaterThanOrEqual(440);
      expect(spineHeight(id)).toBeLessThanOrEqual(520);
      expect(spineBinding(id)).toBe(spineBinding(id));
    }
  });
});

describe("the masthead and captions", () => {
  it("breaks a title so its second line is about a third", async () => {
    const { titleLines, captionParts } = await import("./lore-story");
    expect(titleLines("The Night the Bot Wiped #general")).toEqual(["The Night the Bot", "Wiped #general"]);
    expect(titleLines("Pizza poll")).toEqual(["Pizza poll"]);
    expect(captionParts("23:12 The command.")).toEqual({ label: "23:12", text: "The command." });
    expect(captionParts("Next morning: The apology cake.")).toEqual({ label: "Next morning", text: "The apology cake." });
    expect(captionParts("Just a photo")).toEqual({ label: null, text: "Just a photo" });
  });
});

describe("spreadTail", () => {
  it("leaves room under the story only for photos near its end", async () => {
    const { spreadTail } = await import("./lore-story");
    const many = [p("a"), img(1), p("b"), p("c"), p("d"), p("e"), p("f")];
    expect(spreadTail(spreadLayout(many, images))).toBe(0);
    expect(spreadTail(spreadLayout([p("a"), p("b"), img(2)], images))).toBe(252);
  });
});

describe("shelf rhythm and scale", () => {
  it("never repeats a binding next to itself, and fits a row down to 0.7", () => {
    const row = spineBindings([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    row.forEach((b, i) => i > 0 && expect(b).not.toBe(row[i - 1]));
    expect(shelfScale([100, 100], 10, 420)).toBe(1);
    expect(shelfScale([100, 100], 10, 168)).toBe(0.8);
    expect(shelfScale([100, 100], 10, 50)).toBe(0.7);
  });
});
