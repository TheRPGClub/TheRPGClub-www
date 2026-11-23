import { RotateCcw } from "lucide-react";
import Link from "next/link";

import type { Review } from "@/lib/api/types";
import { reviewHref } from "@/lib/reviews/href";
import type { ReviewFacets } from "@/lib/reviews/facets";
import { isRevisited } from "@/lib/reviews/takes";

// The notes under the game page's small editor: that a revisited Review is
// only edited here in its first take, and that a scorecard is kept.
export function QuickNotes({ existing, facets }: { existing?: Review | null; facets: ReviewFacets | null }) {
  return (
    <>
      {existing && isRevisited(existing) && <RevisedNote reviewId={existing.review_id} />}
      {facets && (
        // Says the scorecard is still there and where to change it. Without
        // this the categories simply vanish from the form, which reads like
        // the save is about to drop them.
        <p className="text-xs text-faint-foreground">
          Scored on {facets.order.length} {facets.order.length === 1 ? "category" : "categories"}, kept as they
          are. Open the full review editor to change them.
        </p>
      )}
    </>
  );
}

// This sheet edits only the first take; the newer ones live on the review
// page, where another starts too.
function RevisedNote({ reviewId }: { reviewId: number }) {
  return (
    <p className="m-0 flex items-start gap-2 text-[0.9rem] leading-[1.4] text-dim-foreground">
      <RotateCcw aria-hidden className="mt-0.5 size-3.5 shrink-0 text-faint-foreground" />
      <span>
        You&apos;ve revisited this review, so this edits your first take only.{" "}
        <Link href={reviewHref(reviewId)} className="font-semibold text-foreground underline underline-offset-2">
          See every take
        </Link>{" "}
        or{" "}
        <Link
          href={reviewHref(reviewId, { revisit: true })}
          className="font-semibold text-foreground underline underline-offset-2"
        >
          revisit it again
        </Link>
        .
      </span>
    </p>
  );
}
