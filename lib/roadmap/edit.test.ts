import { describe, expect, it } from "vitest";
import {
  applyItemZones,
  applyMilestoneOrder,
  areaOf,
  defaultDestination,
  itemDraft,
  itemPayload,
  itemZones,
  milestonePayload,
  reachDescription,
  reachLocally,
  removeItem,
  removeMilestone,
  setShipped,
  unreachLocally,
  upsertItem,
  upsertMilestone,
  withPrecision,
} from "./edit";
import type { Roadmap, RoadmapItem, RoadmapMilestone } from "./types";

const item = (id: number, milestone_id: number, shipped = false): RoadmapItem => ({
  id,
  milestone_id,
  title: `Item ${id}`,
  blurb: "A thing.",
  area: null,
  github_issue_url: null,
  position: id,
  shipped_at: shipped ? "2026-11-20T10:00:00Z" : null,
  feedback: [],
});

const ms = (id: number, position: number, items: RoadmapItem[], reached_at: string | null = null): RoadmapMilestone => ({
  id,
  name: `M${id}`,
  blurb: null,
  target_date: null,
  date_precision: "tba",
  position,
  reached_at,
  items,
});

const roadmap = (): Roadmap => ({
  milestones: [ms(1, 1, [item(1, 1, true), item(2, 1)]), ms(2, 2, [item(3, 2)]), ms(3, 4, [])],
  reached: [ms(9, 3, [item(9, 9, true)], "2026-10-01T00:00:00Z")],
});

describe("item changes", () => {
  it("replaces a known item in place and appends a new one to its Milestone", () => {
    const r = upsertItem(roadmap(), { ...item(2, 1), title: "Renamed" });
    expect(r.milestones[0].items.map((i) => i.title)).toEqual(["Item 1", "Renamed"]);
    const added = upsertItem(roadmap(), item(7, 3));
    expect(added.milestones[2].items.map((i) => i.id)).toEqual([7]);
  });

  it("moves linked Feedback to the saved item", () => {
    const link = { id: 5, title: "Ask", kind: "feature_request" as const, status: "approved" as const, done: false };
    const before = upsertItem(roadmap(), { ...item(1, 1), feedback: [link] });
    const after = upsertItem(before, { ...item(2, 1), feedback: [link] });
    expect(after.milestones[0].items.map((i) => i.feedback.map((f) => f.id))).toEqual([[], [5]]);
  });

  it("removes and ships items", () => {
    expect(removeItem(roadmap(), 2).milestones[0].items.map((i) => i.id)).toEqual([1]);
    expect(setShipped(roadmap(), 2, "2026-11-26T00:00:00Z").milestones[0].items[1].shipped_at).toBe("2026-11-26T00:00:00Z");
    expect(setShipped(roadmap(), 1, null).milestones[0].items[0].shipped_at).toBeNull();
  });
});

describe("Milestone changes", () => {
  it("appends a new Milestone as the last open one and replaces a known one", () => {
    expect(upsertMilestone(roadmap(), ms(5, 5, [])).milestones.map((m) => m.id)).toEqual([1, 2, 3, 5]);
    expect(upsertMilestone(roadmap(), { ...ms(2, 2, []), name: "Later" }).milestones[1].name).toBe("Later");
    expect(removeMilestone(roadmap(), 3).milestones.map((m) => m.id)).toEqual([1, 2]);
  });

  it("reorders the open Milestones, ignoring a list that misses one", () => {
    expect(applyMilestoneOrder(roadmap(), [3, 1, 2]).milestones.map((m) => m.id)).toEqual([3, 1, 2]);
    expect(applyMilestoneOrder(roadmap(), [3, 1]).milestones.map((m) => m.id)).toEqual([1, 2, 3]);
  });
});

describe("item zones", () => {
  it("keys zones by Milestone in order and applies a drop across them", () => {
    const zones = itemZones(roadmap());
    expect(Object.keys(zones)).toEqual(["m1", "m2", "m3"]);
    const r = applyItemZones(roadmap(), { ...zones, m1: [1], m3: [2] });
    expect(r.milestones[2].items).toMatchObject([{ id: 2, milestone_id: 3, position: 1 }]);
    expect(r.milestones[0].items.map((i) => i.id)).toEqual([1]);
  });
});

describe("Reach", () => {
  it("defaults to the next open Milestone, or the one before the last", () => {
    expect(defaultDestination(roadmap(), 1)?.id).toBe(2);
    expect(defaultDestination(roadmap(), 3)?.id).toBe(2);
    expect(defaultDestination({ milestones: [ms(1, 1, [])], reached: [] }, 1)).toBeNull();
  });

  it("moves the unshipped items on and shelves the Milestone first", () => {
    const r = reachLocally(roadmap(), 1, 2, "2026-11-26T00:00:00Z");
    expect(r.milestones.map((m) => m.id)).toEqual([2, 3]);
    expect(r.milestones[0].items.map((i) => i.id)).toEqual([3, 2]);
    expect(r.reached[0]).toMatchObject({ id: 1, reached_at: "2026-11-26T00:00:00Z" });
    expect(r.reached[0].items.map((i) => i.id)).toEqual([1]);
  });

  it("un-reach puts it back where its position says", () => {
    const r = unreachLocally(roadmap(), 9);
    expect(r.milestones.map((m) => m.id)).toEqual([1, 2, 9, 3]);
    expect(r.reached).toEqual([]);
  });
});

describe("forms", () => {
  it("turns the Bot and Web toggles into one area", () => {
    expect(areaOf(true, true)).toBe("both");
    expect(areaOf(false, true)).toBe("website");
    expect(areaOf(false, false)).toBeNull();
    expect(itemDraft({ ...item(1, 1), area: "both" })).toMatchObject({ bot: true, web: true });
  });

  it("checks an item before it is sent", () => {
    const ok = { title: " Roadmap ", blurb: "This page.", bot: false, web: true, github_issue_url: "", shipped: false, feedback: [] };
    expect(itemPayload(ok)).toEqual({
      data: { title: "Roadmap", blurb: "This page.", area: "website", github_issue_url: null, feedback_ids: [] },
    });
    const linked = { ...ok, feedback: [{ id: 7, title: "T", kind: "suggestion" as const, status: "pending" as const, done: false }] };
    expect(itemPayload(linked)).toMatchObject({ data: { feedback_ids: [7] } });
    expect(itemPayload({ ...ok, blurb: " " })).toHaveProperty("error");
    expect(itemPayload({ ...ok, github_issue_url: "https://github.com/a/b/pull/3" })).toHaveProperty("error");
    expect(itemPayload({ ...ok, github_issue_url: "https://github.com/a/b/issues/3" })).toHaveProperty("data");
  });

  it("checks a Milestone's date against its precision", () => {
    const d = { name: "Launch", blurb: "", target_date: null, date_precision: "month" as const };
    expect(milestonePayload(d)).toHaveProperty("error");
    expect(milestonePayload({ ...d, target_date: "2026-12-01" })).toEqual({
      data: { name: "Launch", blurb: null, target_date: "2026-12-01", date_precision: "month" },
    });
    expect(milestonePayload({ ...d, date_precision: "tba", target_date: "2026-12-01" })).toMatchObject({ data: { target_date: null } });
  });
});

describe("withPrecision", () => {
  const draft = { name: "Launch", blurb: "", target_date: "2026-11-15", date_precision: "day" as const };

  it("snaps the target date to its period's first day", () => {
    expect(withPrecision(draft, "month")).toMatchObject({ date_precision: "month", target_date: "2026-11-01" });
    expect(withPrecision(draft, "quarter").target_date).toBe("2026-10-01");
    expect(withPrecision(draft, "year").target_date).toBe("2026-01-01");
    expect(withPrecision(draft, "tba").target_date).toBeNull();
  });
});

describe("reachDescription", () => {
  it("says an empty Milestone goes to the Shipped shelf empty", () => {
    expect(reachDescription("Launch", 0, 0, false)).toBe("Launch has no Roadmap Items, so it goes to the Shipped shelf empty.");
  });

  it("counts what stays and what moves on", () => {
    expect(reachDescription("Launch", 2, 0, false)).toBe("Every item is Shipped, so 2 items go to the Shipped shelf with Launch.");
    expect(reachDescription("Launch", 1, 2, false)).toBe("1 item is Shipped and stays with Launch. These 2 aren't Shipped yet and move on:");
    expect(reachDescription("Launch", 0, 1, true)).toMatch(/^This item isn't Shipped yet .* Add one first\.$/);
  });
});
