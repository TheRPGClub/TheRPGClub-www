import type { Feedback, FeedbackKind } from "@/lib/api/types";

// The card the Give feedback form will pin to the board, as the member types
// it: their own Pending Feedback with no upvotes yet. Its dates never show
// (the preview's byline reads "just now").
export function previewFeedback({
  kind,
  title,
  details,
  authorId,
  authorName,
}: {
  kind: FeedbackKind | null;
  title: string;
  details: string;
  authorId: string;
  authorName: string;
}): Feedback {
  const now = "2026-01-01T00:00:00Z";
  return {
    feedback_id: 0,
    kind: kind ?? "feature_request",
    title: title.trim() || "Your title goes here",
    details: details.trim() || null,
    created_by: authorId,
    created_by_name: authorName,
    created_at: now,
    updated_at: now,
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
}
