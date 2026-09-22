// A review's optional headline — a label, not prose, so it gets its own
// short cap independent of `MAX_REVIEW_LENGTH` in ./review-body.

export const MAX_REVIEW_TITLE_LENGTH = 120;

/**
 * Untrusted input to a clean title, or null for "no title" — trimmed, with
 * internal whitespace collapsed, blank reduced to null rather than kept as
 * an empty string.
 */
export function sanitizeReviewTitle(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const title = raw.trim().replace(/\s+/g, " ");
  return title.length > 0 ? title : null;
}
