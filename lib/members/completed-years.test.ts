import { describe, expect, it } from "vitest";

import { completedYearView } from "@/lib/members/completed-years";

// The member's completions tallied by month, as the API's
// `completions/months` returns them: newest first, undated last.
const months = [
  { month: "2026-08", count: 2 },
  { month: "2026-03", count: 1 },
  { month: "2025-03", count: 1 },
  { month: null, count: 1 },
];

const view = (over: Partial<Parameters<typeof completedYearView>[0]> = {}) =>
  completedYearView({ userId: "7", months, yearParam: "", q: "", pageSize: 2, ...over });

describe("completedYearView", () => {
  it("lists the years newest first, with undated completions last", () => {
    expect(view().dialYears).toEqual([
      { key: "2026", label: "2026", count: 3, href: "/members/7/completed-games?year=2026" },
      { key: "2025", label: "2025", count: 1, href: "/members/7/completed-games?year=2025" },
      { key: "unknown", label: "No date", count: 1, href: "/members/7/completed-games?year=unknown" },
    ]);
  });

  it("opens on the newest year, or every year while searching or without any tallies", () => {
    expect(view().year).toBe("2026");
    expect(view({ q: "zelda" }).year).toBe("all");
    expect(view({ months: null }).year).toBe("all");
    expect(view({ months: [] }).year).toBe("all");
  });

  it("keeps a valid year from the URL and drops anything else", () => {
    expect(view({ yearParam: "1999" }).year).toBe("1999");
    expect(view({ yearParam: "unknown" }).year).toBe("unknown");
    expect(view({ yearParam: "all" }).year).toBe("all");
    expect(view({ yearParam: "19x" }).year).toBe("2026");
  });

  it("builds list links that keep the search and leave page one off", () => {
    const { hrefFor } = view({ q: "mario" });
    expect(hrefFor("2025")).toBe("/members/7/completed-games?year=2025&q=mario");
    expect(hrefFor("all", 3)).toBe("/members/7/completed-games?year=all&q=mario&page=3");
    expect(hrefFor(null, 1, "")).toBe("/members/7/completed-games");
  });

  it("jumps to each month of the year on the page that holds it", () => {
    const jumps = view().monthJumps;
    expect([...jumps.entries()]).toEqual([
      ["2026-08", { count: 2, href: "/members/7/completed-games?year=2026#m-2026-08" }],
      ["2026-03", { count: 1, href: "/members/7/completed-games?year=2026&page=2#m-2026-03" }],
    ]);
  });

  it("has no month jumps for every year, undated entries or a search", () => {
    expect(view({ yearParam: "all" }).monthJumps.size).toBe(0);
    expect(view({ yearParam: "unknown" }).monthJumps.size).toBe(0);
    expect(view({ yearParam: "2026", q: "x" }).monthJumps.size).toBe(0);
  });
});
