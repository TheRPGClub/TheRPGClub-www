import { describe, expect, it } from "vitest";
import type { Feedback } from "@/lib/api/types";
import {
  boardHref,
  boardKind,
  boardStatus,
  canEdit,
  canUpvote,
  canWithdraw,
  dialogClosedHref,
  editFeedbackHref,
  feedbackDialogState,
  feedbackPhase,
  giveFeedbackHref,
  issueRef,
  pinnedHref,
  screenshotProblem,
  upvoteLabel,
  validateFeedbackInput,
} from "@/lib/feedback";

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
const row = (over: Partial<Feedback>): Feedback => ({ ...base, feedback_id: 3, ...over });

describe("feedbackPhase", () => {
  it("reads Done off an Approved row with done set, else the status", () => {
    expect(feedbackPhase(row({ status: "approved", done: true }))).toBe("done");
    expect(feedbackPhase(row({ status: "approved" }))).toBe("approved");
    expect(feedbackPhase(row({ status: "duplicate" }))).toBe("duplicate");
  });
});

describe("canUpvote", () => {
  it("takes upvotes while Pending or Approved and not Done; frozen otherwise", () => {
    expect(canUpvote(row({ status: "pending" }))).toBe(true);
    expect(canUpvote(row({ status: "approved" }))).toBe(true);
    expect(canUpvote(row({ status: "approved", done: true }))).toBe(false);
    for (const status of ["rejected", "duplicate", "withdrawn"] as const) {
      expect(canUpvote(row({ status }))).toBe(false);
    }
  });
});

describe("author controls", () => {
  it("lets only the author edit or withdraw, and only while Pending", () => {
    expect(canEdit(row({}), "7")).toBe(true);
    expect(canWithdraw(row({}), "8")).toBe(false);
    expect(canEdit(row({ status: "approved" }), "7")).toBe(false);
  });
});

describe("upvoteLabel", () => {
  it("says I hit this too on a Bug Report", () => {
    expect(upvoteLabel("bug_report", false)).toBe("I hit this too");
    expect(upvoteLabel("feature_request", true)).toBe("Upvoted");
  });
});

describe("board URLs", () => {
  it("leaves the default kind and Open out of the address", () => {
    expect(boardHref("feature_request")).toBe("/feedback");
    expect(boardHref("bug_report", "closed")).toBe("/feedback?kind=bug_report&status=closed");
    expect(pinnedHref({ feedback_id: 9 })).toBe("/feedback?pinned=9");
    expect(giveFeedbackHref("bug_report")).toBe("/feedback?new=1&kind=bug_report");
    expect(editFeedbackHref({ feedback_id: 9 })).toBe("/feedback?edit=9");
  });

  it("reads only known kinds and statuses", () => {
    expect(boardKind("suggestion")).toBe("suggestion");
    expect(boardKind("bug")).toBeNull();
    expect(boardStatus("closed")).toBe("closed");
    expect(boardStatus("done")).toBeNull();
  });
});

describe("issueRef", () => {
  it("names the repo's short name and the issue", () => {
    expect(issueRef({ target_repo: "TheRPGClub/TheRPGClub-www", github_issue_number: 58 })).toBe("www #58");
    expect(issueRef({ target_repo: null, github_issue_number: null })).toBeNull();
  });
});

describe("validateFeedbackInput", () => {
  it("needs a kind, a title and details", () => {
    expect(validateFeedbackInput({ kind: null, title: "a", details: "b" }).ok).toBe(false);
    expect(validateFeedbackInput({ kind: "suggestion", title: "  a  b ", details: " c " })).toEqual({
      ok: true,
      data: { kind: "suggestion", title: "a b", details: "c" },
    });
  });
});

describe("validateFeedbackInput for a Bug Report", () => {
  const bug = { kind: "bug_report", title: "Pick", where: "website", what_happened: " x ", expected: "y", steps: " " };

  it("needs where, what happened and what was expected; steps are optional", () => {
    expect(validateFeedbackInput(bug)).toEqual({
      ok: true,
      data: { kind: "bug_report", title: "Pick", where: "website", what_happened: "x", expected: "y", steps: null },
    });
    expect(validateFeedbackInput({ ...bug, where: null })).toMatchObject({ ok: false, error: expect.stringContaining("where") });
    expect(validateFeedbackInput({ ...bug, where: "discord" }).ok).toBe(false);
    expect(validateFeedbackInput({ ...bug, what_happened: "" }).ok).toBe(false);
    expect(validateFeedbackInput({ ...bug, expected: " " }).ok).toBe(false);
  });

  it("drops details from a Bug Report and bug fields from the others", () => {
    const res = validateFeedbackInput({ ...bug, details: "d" });
    expect(res.ok && res.data.details).toBeFalsy();
    const other = validateFeedbackInput({ ...bug, kind: "feature_request", details: "d" });
    expect(other).toEqual({ ok: true, data: { kind: "feature_request", title: "Pick", details: "d" } });
  });

  it("caps the long fields", () => {
    expect(validateFeedbackInput({ ...bug, steps: "s".repeat(4001) }).ok).toBe(false);
  });
});

describe("screenshotProblem", () => {
  it("takes PNG, JPEG and WebP up to 4 MB", () => {
    expect(screenshotProblem({ type: "image/png", size: 1000 })).toBeNull();
    expect(screenshotProblem({ type: "image/webp", size: 4 * 1024 * 1024 })).toBeNull();
    expect(screenshotProblem({ type: "image/gif", size: 1000 })).toMatch(/PNG, JPEG or WebP/);
    expect(screenshotProblem({ type: "image/jpeg", size: 4 * 1024 * 1024 + 1 })).toMatch(/4 MB/);
    expect(screenshotProblem({ type: "image/jpeg", size: 0 })).toMatch(/empty/);
  });
});

describe("feedbackDialogState", () => {
  const args = { isNew: false, editId: 0, editItem: null, kind: "suggestion" as const, canGive: true, viewerId: "7" };

  it("opens nothing without new or edit", () => {
    expect(feedbackDialogState(args)).toBeNull();
  });

  it("opens create on the shown kind for those who can give feedback", () => {
    expect(feedbackDialogState({ ...args, isNew: true })).toEqual({ mode: "create", kind: "suggestion" });
    expect(feedbackDialogState({ ...args, isNew: true, canGive: false })).toMatchObject({ mode: "refused" });
  });

  it("opens edit only for the author's Pending Feedback", () => {
    expect(feedbackDialogState({ ...args, editId: 1, editItem: base })).toEqual({ mode: "edit", feedback: base });
    expect(feedbackDialogState({ ...args, editId: 1, editItem: base, viewerId: "8" })).toEqual({
      mode: "refused",
      message: "Only its author can edit it.",
    });
    expect(feedbackDialogState({ ...args, editId: 1, editItem: { ...base, status: "approved" } })).toMatchObject({
      mode: "refused",
      message: expect.stringContaining("reviewed"),
    });
    expect(feedbackDialogState({ ...args, editId: 9 })).toMatchObject({ mode: "refused" });
  });
});

describe("dialogClosedHref", () => {
  it("keeps the board's place and drops new and edit", () => {
    expect(dialogClosedHref(new URLSearchParams("new=1&kind=bug_report"))).toBe("/feedback?kind=bug_report");
    expect(dialogClosedHref(new URLSearchParams("edit=4"))).toBe("/feedback");
  });
});
