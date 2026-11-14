import type { Suggestion } from "@/lib/api/types";
import { SUGGESTION_TYPES, type SuggestionType } from "@/lib/suggestions";

// The card the Suggest something form will pin to the board, as the member
// types it: their own Pending Suggestion with no upvotes yet. Its dates never
// show (the preview's byline reads "just now").
export function previewSuggestion({
  title,
  details,
  types,
  authorId,
  authorName,
}: {
  title: string;
  details: string;
  types: SuggestionType[];
  authorId: string;
  authorName: string;
}): Suggestion {
  const now = "2026-01-01T00:00:00Z";
  return {
    suggestion_id: 0,
    title: title.trim() || "Your title goes here",
    details: details.trim() || null,
    created_by: authorId,
    created_by_name: authorName,
    created_at: now,
    updated_at: now,
    labels: SUGGESTION_TYPES.filter((t) => types.includes(t.value))
      .map((t) => t.value)
      .join(", "),
    status: "pending",
    reviewed_by: null,
    reviewed_at: null,
    rejection_reason: null,
    target_repo: null,
    github_issue_number: null,
    github_issue_url: null,
    github_issue_state: null,
    upvote_count: 0,
    viewer_upvoted: false,
  };
}
