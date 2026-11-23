import type { Review, ReviewRevision } from "@/lib/api/types";
import { isDraft } from "@/lib/reviews/draft";

// What a review's own page shows, from its query: the read view, or the desk
// on one take.
export type ReviewPageMode =
  | { kind: "read" }
  // The first take (the Review itself), Draft or Published.
  | { kind: "review" }
  // A Revision: the Draft one under `?revisit`, a Published one under
  // `?revision=<id>`.
  | { kind: "revision"; revision: ReviewRevision }
  // `?revisit` with no Draft Revision yet: start one.
  | { kind: "start-revisit" };

export function reviewPageMode(
  review: Pick<Review, "published_at" | "revisions" | "draft_revision">,
  query: { edit?: string; revision?: string; revisit?: string },
  isMine: boolean,
): ReviewPageMode {
  if (!isMine) return { kind: "read" };
  // A Draft has no read view for its author, and no Revisions yet.
  if (isDraft(review)) return { kind: "review" };
  if (query.revisit !== undefined) {
    return review.draft_revision
      ? { kind: "revision", revision: review.draft_revision }
      : { kind: "start-revisit" };
  }
  if (query.revision !== undefined) {
    const id = Number(query.revision);
    const revision = (review.revisions ?? []).find((r) => r.revision_id === id && r.published_at != null);
    // One deleted meanwhile, or a Draft's id: the page as it reads.
    return revision ? { kind: "revision", revision } : { kind: "read" };
  }
  if (query.edit !== undefined) return { kind: "review" };
  return { kind: "read" };
}
