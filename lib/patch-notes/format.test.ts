import { describe, expect, it } from "vitest";

import { patchDate, patchDay, patchLongDate, patchTitle, stackNote, titleLines } from "./format";
import { patchNumberParam, patchPath } from "./paths";
import type { Patch } from "./types";

const patch = (number: number, published_at: string | null, title: string | null = null) =>
  ({ number, title, published_at }) as Patch;

describe("Patch dates", () => {
  // 02:00 UTC on 27 November is still 26 November in New York.
  const late = patch(4, "2026-11-27T02:00:00Z");

  it("reads in the club's time zone", () => {
    expect(patchDate(late)).toBe("26 Nov 2026");
    expect(patchDay(late)).toBe("26 Nov");
    expect(patchLongDate(late)).toBe("26 November 2026");
  });

  it("says nothing for a draft or a bad date", () => {
    expect(patchDate(patch(1, null))).toBe("");
    expect(patchDay(patch(1, "not a date"))).toBe("");
  });

  it("shortens September to Sep", () => {
    expect(patchDate(patch(1, "2026-09-10T15:00:00Z"))).toBe("10 Sep 2026");
  });
});

describe("patchTitle", () => {
  it("uses the title, or Patch N without one", () => {
    expect(patchTitle(patch(4, null, "The Franchise update"))).toBe("The Franchise update");
    expect(patchTitle(patch(2, null, "  "))).toBe("Patch 2");
    expect(patchTitle(patch(2, null))).toBe("Patch 2");
  });
});

describe("titleLines", () => {
  it("puts at least a quarter of the letters on the second line, in whole words", () => {
    expect(titleLines("The Franchise update")).toEqual(["The Franchise", "update"]);
    expect(titleLines("Patch Notes launch")).toEqual(["Patch Notes", "launch"]);
    expect(titleLines("A big one for the series fans")).toEqual(["A big one for the", "series fans"]);
  });

  it("keeps one word on one line", () => {
    expect(titleLines("Hotfix")).toEqual(["Hotfix", null]);
  });

  it("splits a short pair", () => {
    expect(titleLines("Patch 2")).toEqual(["Patch", "2"]);
  });
});

describe("stackNote", () => {
  it("counts the Patches and dates the newest", () => {
    expect(stackNote([patch(4, "2026-11-26T15:00:00Z"), patch(3, "2026-11-19T15:00:00Z")])).toBe(
      "2 Patches · newest 26 Nov",
    );
    expect(stackNote([patch(1, "2026-11-05T15:00:00Z")])).toBe("1 Patch · newest 5 Nov");
    expect(stackNote([])).toBe("0 Patches");
  });
});

describe("Patch paths", () => {
  it("links a Patch by its number", () => {
    expect(patchPath(4)).toBe("/patch-notes/4");
  });

  it("reads only a whole number from 1", () => {
    expect(patchNumberParam("12")).toBe(12);
    expect(patchNumberParam("0")).toBeNull();
    expect(patchNumberParam("012")).toBeNull();
    expect(patchNumberParam("4.5")).toBeNull();
    expect(patchNumberParam("four")).toBeNull();
  });
});
