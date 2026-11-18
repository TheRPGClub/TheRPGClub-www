import { RichTextContent } from "@/components/rich-text/rich-text-content";
import { reviewBodyValue } from "@/lib/api/review-body";
import type { ReviewBody } from "@/lib/api/types";
import type { ReviewAccent } from "@/lib/reviews/accent";

// Read-only rendering of a review body, on the server: the shared rich-text
// renderer, fed whatever shape the body was stored in.

export interface ReviewBodyContentProps {
  body: ReviewBody;
  className?: string;
  // `compact` is every place a review is quoted alongside other UI: the
  // listing card's excerpt, the composer's own preview. `article` is the
  // review's own page and the reviews list's reader, set at a reading measure.
  variant?: "compact" | "article";
  // Kept for callers that still pass it; the article no longer tints by track.
  accent?: ReviewAccent;
}

/**
 * Renders a stored review body: Plate value, legacy string or imported
 * `{summary}` object alike. Returns null when there is nothing to show, so
 * callers keep control of their own "no body" copy.
 */
export function ReviewBodyContent({
  body,
  className,
  variant = "compact",
}: ReviewBodyContentProps) {
  return (
    <RichTextContent
      value={reviewBodyValue(body)}
      variant={variant}
      className={className}
    />
  );
}
