import { describe, expect, it } from "vitest";
import type { Feedback } from "@/lib/api/types";
import {
  claimFeedback,
  feedbackHolder,
  feedbackLine,
  matchFeedback,
  roadmapPinLine,
  toRoadmapFeedback,
} from "./feedback";
import type { Roadmap, RoadmapFeedback, RoadmapItem, RoadmapMilestone } from "./types";

const fb = (id: number, title = `Feedback ${id}`, extra: Partial<RoadmapFeedback> = {}): RoadmapFeedback => ({
  id,
  title,
  kind: "feature_request",
  status: "approved",
  done: false,
  ...extra,
});

const item = (id: number, milestone_id: number, feedback: RoadmapFeedback[] = []): RoadmapItem => ({
  id,
  milestone_id,
  title: `Item ${id}`,
  blurb: "A thing.",
  area: null,
  github_issue_url: null,
  position: id,
  shipped_at: null,
  feedback,
});

const ms = (id: number, items: RoadmapItem[], reached_at: string | null = null): RoadmapMilestone => ({
  id,
  name: `M${id}`,
  blurb: null,
  target_date: null,
  date_precision: "tba",
  position: id,
  reached_at,
  items,
});

const roadmap = (): Roadmap => ({
  milestones: [ms(1, [item(1, 1, [fb(10), fb(11)]), item(2, 1)])],
  reached: [ms(9, [item(3, 9, [fb(12)])], "2026-11-01T00:00:00Z")],
});

describe("the roadmap badge", () => {
  it("names the Milestone, or Shipped once the item ships", () => {
    expect(roadmapPinLine({ item_id: 1, milestone_name: "Launch", shipped: false })).toBe("Launch");
    expect(roadmapPinLine({ item_id: 1, milestone_name: "Launch", shipped: true })).toBe("Shipped");
  });
});

describe("Feedback links", () => {
  it("finds the item a Feedback is linked to, open or Reached", () => {
    expect(feedbackHolder(roadmap(), 11)?.id).toBe(1);
    expect(feedbackHolder(roadmap(), 12)?.id).toBe(3);
    expect(feedbackHolder(roadmap(), 99)).toBeNull();
    expect(feedbackHolder(roadmap(), 11, 1)).toBeNull();
  });

  it("takes a saved item's Feedback off every other item (it moved)", () => {
    const saved = item(2, 1, [fb(11), fb(12)]);
    const next = claimFeedback(roadmap(), saved);
    expect(next.milestones[0].items[0].feedback.map((f) => f.id)).toEqual([10]);
    expect(next.reached[0].items[0].feedback).toEqual([]);
  });

  it("matches Feedback by title, leaving out the linked ones", () => {
    const all = [fb(1, "Dark mode"), fb(2, "Dark-mode toggle"), fb(3, "GOTM reminder")];
    expect(matchFeedback(all, "  DARK ", [1]).map((f) => f.id)).toEqual([2]);
    expect(matchFeedback(all, "", [])).toEqual([]);
    expect(matchFeedback(all, "#3", [])).toEqual([fb(3, "GOTM reminder")]);
    expect(matchFeedback(all, "o", [], 2)).toHaveLength(2);
  });

  it("describes a Feedback by kind and state", () => {
    expect(feedbackLine(fb(1))).toBe("Feature Request · Approved");
    expect(feedbackLine(fb(1, "x", { kind: "bug_report", done: true }))).toBe("Bug Report · Done");
  });

  it("reads a Feedback row as the item's link", () => {
    const row = { feedback_id: 4, title: "T", kind: "suggestion", status: "pending", done: false } as Feedback;
    expect(toRoadmapFeedback(row)).toEqual({ id: 4, title: "T", kind: "suggestion", status: "pending", done: false });
  });
});
