import { describe, expect, it } from "vitest";
import type { Feedback } from "@/lib/api/types";
import { previewFeedback } from "@/lib/feedback-preview";
import {
  boardHref,
  boardKind,
  boardStatus,
  canEdit,
  canUpvote,
  canWithdraw,
  feedbackPhase,
  issueRef,
  pinnedHref,
  upvoteLabel,
  validateFeedbackInput,
} from "@/lib/feedback";

const base: Feedback = previewFeedback({ kind: "suggestion", title: "T", details: "D", authorId: "7", authorName: "A" });
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
