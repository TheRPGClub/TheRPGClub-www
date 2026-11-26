import { describe, expect, it } from "vitest";
import { areaTags, milestoneDate, reachedHeading, readyCount, roadmapEmpty, tierLabel } from "./tree";
import type { RoadmapItem, RoadmapMilestone } from "./types";

const item = (id: number, shipped: boolean): RoadmapItem => ({
  id,
  milestone_id: 1,
  title: `Item ${id}`,
  blurb: "A thing.",
  area: null,
  github_issue_url: null,
  position: id,
  shipped_at: shipped ? "2026-11-20T10:00:00Z" : null,
});

const milestone = (over: Partial<RoadmapMilestone> = {}): RoadmapMilestone => ({
  id: 1,
  name: "Launch",
  blurb: null,
  target_date: "2026-12-01",
  date_precision: "month",
  position: 1,
  reached_at: null,
  items: [item(1, true), item(2, true), item(3, false)],
  ...over,
});

describe("milestoneDate", () => {
  it("writes the date at its precision", () => {
    expect(milestoneDate(milestone())).toBe("Dec 2026");
    expect(milestoneDate(milestone({ target_date: "2027-01-01", date_precision: "quarter" }))).toBe("Q1 2027");
  });

  it("reads TBA without a date", () => {
    expect(milestoneDate(milestone({ target_date: null, date_precision: "tba" }))).toBe("TBA");
  });
});

describe("tierLabel", () => {
  it("leads the first tier with Next up and counts ready items", () => {
    expect(readyCount(milestone())).toEqual({ ready: 2, total: 3 });
    expect(tierLabel(milestone(), true)).toEqual(["Next up", "Dec 2026", "2 of 3 ready"]);
    expect(tierLabel(milestone(), false)).toEqual(["Dec 2026", "2 of 3 ready"]);
  });

  it("says when a tier has no items", () => {
    expect(tierLabel(milestone({ items: [] }), false)).toEqual(["Dec 2026", "Nothing on it yet"]);
  });
});

describe("areaTags", () => {
  it("draws Both as the Bot and Web tags", () => {
    expect(areaTags("both")).toEqual(["bot", "web"]);
    expect(areaTags("bot")).toEqual(["bot"]);
    expect(areaTags("website")).toEqual(["web"]);
    expect(areaTags(null)).toEqual([]);
  });
});

describe("reachedHeading", () => {
  it("dates a Reached Milestone by the month it was Reached, in UTC", () => {
    expect(reachedHeading({ name: "Beta", reached_at: "2026-10-31T23:30:00Z" })).toBe("Shipped at Beta · Oct 2026");
  });
});

describe("roadmapEmpty", () => {
  it("is empty only with no Milestones at all", () => {
    expect(roadmapEmpty({ milestones: [], reached: [] })).toBe(true);
    expect(roadmapEmpty({ milestones: [], reached: [milestone()] })).toBe(false);
  });
});
