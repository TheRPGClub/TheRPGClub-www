import { describe, expect, it } from "vitest";
import type { Feedback } from "@/lib/api/types";
import {
  defaultRepoFor,
  duplicateButtonLabel,
  duplicateCandidates,
  isValidOriginal,
  laneRows,
  rejectPicksFor,
  rowsAfterDuplicate,
  type DuplicateCandidate,
} from "@/lib/feedback-desk";

const base: Feedback = {
  feedback_id: 1,
  kind: "suggestion",
  title: "T",
  details: "D",
  created_by: "7",
  created_by_name: "A",
  created_at: "2026-11-01T00:00:00Z",
  updated_at: "2026-11-01T00:00:00Z",
  status: "pending",
  reviewed_by: null,
  reviewed_at: null,
  rejection_reason: null,
  duplicate_of_id: null,
  target_repo: null,
  github_issue_number: null,
  github_issue_url: null,
  github_issue_state: null,
  done: false,
  done_at: null,
  upvote_count: 0,
  viewer_upvoted: false,
};
const row = (over: Partial<Feedback>): Feedback => ({ ...base, ...over });

describe("laneRows", () => {
  it("keeps one kind's Pending Feedback, most upvoted first, then oldest", () => {
    const rows = [
      row({ feedback_id: 1, upvote_count: 2, created_at: "2026-11-03T00:00:00Z" }),
      row({ feedback_id: 2, upvote_count: 9 }),
      row({ feedback_id: 3, upvote_count: 2, created_at: "2026-11-02T00:00:00Z" }),
      row({ feedback_id: 4, kind: "bug_report", upvote_count: 50 }),
      row({ feedback_id: 5, status: "approved", upvote_count: 40 }),
    ];
    expect(laneRows(rows, "suggestion").map((f) => f.feedback_id)).toEqual([2, 3, 1]);
    expect(laneRows(rows, "bug_report").map((f) => f.feedback_id)).toEqual([4]);
  });
});

describe("defaultRepoFor", () => {
  it("pre-fills from a Bug Report's Where", () => {
    expect(defaultRepoFor({ kind: "bug_report", where: "bot" })).toBe("TheRPGClub/TheRPGClub-bot");
    expect(defaultRepoFor({ kind: "bug_report", where: "website" })).toBe("TheRPGClub/TheRPGClub-www");
    expect(defaultRepoFor({ kind: "bug_report", where: null })).toBeNull();
  });

  it("leaves the other kinds unpicked", () => {
    expect(defaultRepoFor({ kind: "suggestion", where: "bot" })).toBeNull();
  });
});

describe("rejectPicksFor", () => {
  it("offers the quick picks on Bug Reports only", () => {
    expect(rejectPicksFor("bug_report")).toEqual(["Can't reproduce", "Working as intended"]);
    expect(rejectPicksFor("feature_request")).toEqual([]);
  });
});

describe("duplicateCandidates", () => {
  const c = (over: Partial<DuplicateCandidate>): DuplicateCandidate => ({
    feedback_id: 1,
    kind: "bug_report",
    title: "Backlog pick ignores the platform filter",
    status: "pending",
    done: false,
    upvote_count: 0,
    ...over,
  });
  const rows = [
    c({ feedback_id: 1 }),
    c({ feedback_id: 2, title: "Backlog picker shows PS5 games", upvote_count: 3 }),
    c({ feedback_id: 3, title: "Backlog sort", status: "rejected" }),
    c({ feedback_id: 4, title: "Backlog done thing", status: "approved", done: true }),
    c({ feedback_id: 5, title: "Backlog dupe", status: "duplicate" }),
    c({ feedback_id: 6, title: "Birthday shows a day early" }),
  ];

  it("offers only Pending, Approved and Done Feedback other than itself", () => {
    expect(duplicateCandidates(rows, 1, "backlog").map((f) => f.feedback_id)).toEqual([2, 4]);
    expect(isValidOriginal({ status: "withdrawn" })).toBe(false);
  });

  it("matches every word typed in any order, ignoring case", () => {
    expect(duplicateCandidates(rows, 9, "FILTER backlog").map((f) => f.feedback_id)).toEqual([1]);
    expect(duplicateCandidates(rows, 9, "  ").map((f) => f.feedback_id)).toEqual([2, 1, 4, 6]);
  });

  it("caps the list", () => {
    expect(duplicateCandidates(rows, 9, "", 2)).toHaveLength(2);
  });
});

describe("duplicateButtonLabel", () => {
  it("says how many upvotes move", () => {
    expect(duplicateButtonLabel(0)).toBe("Mark duplicate");
    expect(duplicateButtonLabel(1)).toBe("Mark duplicate · 1 upvote moves there");
    expect(duplicateButtonLabel(23)).toBe("Mark duplicate · 23 upvotes move there");
  });
});

describe("rowsAfterDuplicate", () => {
  const a = { ...base, feedback_id: 1, upvote_count: 2 };
  const b = { ...base, feedback_id: 2, upvote_count: 3 };
  const c = { ...base, feedback_id: 3, upvote_count: 1 };

  it("drops the Duplicate and takes the API's fresh original", () => {
    const fresh = { ...a, upvote_count: 5 };
    expect(rowsAfterDuplicate([a, b, c], 2, 1, fresh)).toEqual([fresh, c]);
  });

  it("without a fresh copy, adds the Duplicate's upvotes to the original, so its lane re-sorts", () => {
    const after = rowsAfterDuplicate([a, b, c], 2, 1, null);
    expect(after.map((r) => [r.feedback_id, r.upvote_count])).toEqual([[1, 5], [3, 1]]);
    expect(laneRows([...after, { ...c, feedback_id: 4, upvote_count: 4 }], "suggestion").map((r) => r.feedback_id)).toEqual([1, 4, 3]);
  });

  it("leaves the rows alone when the original isn't in a lane (it was Approved)", () => {
    expect(rowsAfterDuplicate([a, b], 2, 99, null)).toEqual([a]);
  });
});
