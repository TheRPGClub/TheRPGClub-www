import { describe, expect, it } from "vitest";
import { LINE_WIDTHS, addOnsShown, lineBreaks } from "./series-line";

describe("lineBreaks", () => {
  it("marks where a row of the line ends and the next one starts", () => {
    // 16 stations, 8 to a row: VIII ends row one, IX starts row two.
    expect(lineBreaks(7, 16, 8)).toEqual({ end: true, start: false });
    expect(lineBreaks(8, 16, 8)).toEqual({ end: false, start: true });
    expect(lineBreaks(3, 16, 8)).toEqual({ end: false, start: false });
  });

  it("never wraps past the last station or before the first", () => {
    expect(lineBreaks(15, 16, 8)).toEqual({ end: false, start: false });
    expect(lineBreaks(0, 16, 8)).toEqual({ end: false, start: false });
    expect(lineBreaks(3, 4, 4)).toEqual({ end: false, start: false });
  });

  it("works out every width the line draws at", () => {
    expect(LINE_WIDTHS.map((w) => w.cols)).toEqual([4, 6, 8]);
  });
});

describe("addOnsShown", () => {
  it("shows every Add-on up to one past the limit", () => {
    expect(addOnsShown(3)).toBe(3);
    expect(addOnsShown(4)).toBe(4);
  });

  it("folds the rest into N more past that", () => {
    expect(addOnsShown(5)).toBe(3);
    expect(addOnsShown(12)).toBe(3);
  });

  it("shows them all once opened", () => {
    expect(addOnsShown(12, true)).toBe(12);
  });
});
