import dynamic from "next/dynamic";
import type { ReviewBody } from "@/lib/api/types";

// Code-split, not client-only: the card is reached through client lists (the
// game page's composer wraps it), and a static import would put the whole
// Plate renderer in their bundle. The excerpt stays server-prerendered and
// keeps its formatting and spoilers.
const ReviewBodyContent = dynamic(() =>
  import("@/components/member/review-body").then((m) => ({
    default: m.ReviewBodyContent,
  })),
);

// A review card's excerpt, or a note that the review is a score alone.
export function ReviewCardBody({
  hasBody,
  excerpt,
}: {
  hasBody: boolean;
  excerpt: ReviewBody;
}) {
  return hasBody ? (
    <div className="text-[0.88rem] leading-[1.6] text-dim-foreground [&_h1]:text-foreground [&_h2]:text-foreground [&_h3]:text-foreground">
      <ReviewBodyContent body={excerpt} />
    </div>
  ) : (
    <p className="text-[0.88rem] text-faint-foreground italic">
      Scored without a written review.
    </p>
  );
}
