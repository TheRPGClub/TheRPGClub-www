import { describe, expect, it } from "vitest";
import {
  browseApiPath,
  browseHref,
  parseBrowseQuery,
  progressPercent,
  tagCounts,
  tileCounts,
  yearSpan,
  type FranchiseTile,
} from "./browse";

const tile = (over: Partial<FranchiseTile> = {}): FranchiseTile => ({
  franchise_id: 1,
  name: "Final Fantasy",
  games_count: 31,
  mainline_count: 16,
  spin_off_count: 15,
  add_on_count: 8,
  first_year: 1987,
  latest_year: 2025,
  club_plays: 4,
  covers: [],
  ...over,
});

describe("parseBrowseQuery", () => {
  it("reads search, letter, sort and page", () => {
    expect(
      parseBrowseQuery({ q: " final ", letter: "f", sort: "plays", page: "3" }),
    ).toEqual({
      q: "final",
      letter: "F",
      sort: "plays",
      page: 3,
    });
  });

  it("drops what the API would refuse", () => {
    expect(
      parseBrowseQuery({ letter: "ab", sort: "rank", page: "-2" }),
    ).toEqual({
      q: "",
      letter: null,
      sort: "az",
      page: 1,
    });
  });

  it("takes # and the first of repeated params", () => {
    expect(
      parseBrowseQuery({ letter: ["#", "B"], q: ["ys", "tales"] }),
    ).toMatchObject({ letter: "#", q: "ys" });
  });
});

describe("browseHref", () => {
  it("keeps A-Z and page one bare", () => {
    expect(browseHref({ q: "", sort: "az", page: 1, letter: null })).toBe(
      "/franchises",
    );
  });

  it("puts every part in the URL", () => {
    expect(
      browseHref({ q: "tales", letter: "#", sort: "games", page: 2 }),
    ).toBe("/franchises?q=tales&letter=%23&sort=games&page=2");
  });

  it("round-trips through parseBrowseQuery", () => {
    const query = {
      q: "dragon quest",
      letter: "D",
      sort: "plays" as const,
      page: 4,
    };
    const params = Object.fromEntries(
      new URL(browseHref(query), "http://x").searchParams,
    );
    expect(parseBrowseQuery(params)).toEqual(query);
  });
});

describe("browseApiPath", () => {
  it("sends the query and the page size", () => {
    expect(
      browseApiPath({ q: "ys", letter: "Y", sort: "az", page: 2 }, 48),
    ).toBe("/api/v1/franchises/browse?sort=az&page=2&per=48&q=ys&letter=Y");
  });
});

describe("tile text", () => {
  it("counts the tile and the tag", () => {
    expect(tileCounts(tile()).join(" · ")).toBe(
      "16 Mainline · 31 Games · 8 Add-ons",
    );
    expect(tagCounts(tile()).join(" · ")).toBe(
      "16 Mainline · 15 Spin-offs · 8 Add-ons",
    );
  });

  it("says one in the singular", () => {
    expect(
      tileCounts(tile({ games_count: 1, add_on_count: 1 })).join(" · "),
    ).toBe("16 Mainline · 1 Game · 1 Add-on");
    expect(tagCounts(tile({ spin_off_count: 1 })).join(" · ")).toBe(
      "16 Mainline · 1 Spin-off · 8 Add-ons",
    );
  });

  it("spans the years", () => {
    expect(yearSpan(tile())).toBe("1987–2025");
    expect(yearSpan(tile({ latest_year: 1987 }))).toBe("1987");
    expect(yearSpan(tile({ first_year: null }))).toBe("2025");
    expect(yearSpan(tile({ first_year: null, latest_year: null }))).toBeNull();
  });

  it("fills the progress bar", () => {
    expect(progressPercent({ done: 9, total: 16 })).toBe(56);
    expect(progressPercent({ done: 0, total: 0 })).toBe(0);
  });
});
