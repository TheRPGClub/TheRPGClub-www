import { Pencil } from "lucide-react";
import Link from "next/link";

import {
  ReviewerAvatar,
  ScoreBox,
  formatReviewDate,
} from "@/components/issue/review-meta";
import { MAX_RATING } from "@/lib/api/rating";

// The review banner's byline (the reviewer, when they reviewed, and the
// author's "Edit your review") and its score in a paper block.

export function ReviewBannerByline({
  authorId,
  authorName,
  createdAt,
  canEdit,
}: {
  authorId: string;
  authorName: string;
  createdAt?: string | null;
  canEdit?: boolean;
}) {
  return (
    <p className="mt-4.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm text-dim-foreground">
      <ReviewerAvatar userId={authorId} name={authorName} size="lg" />
      <span>
        <Link
          href={`/members/${authorId}`}
          className="font-semibold text-foreground transition-colors hover:text-highlight"
        >
          {authorName}
        </Link>
        {createdAt && (
          <>
            {" · reviewed "}
            <time dateTime={createdAt}>{formatReviewDate(createdAt)}</time>
          </>
        )}
      </span>
      {canEdit && (
        <Link
          href="?edit=1"
          className="font-label ml-1.5 inline-flex items-center gap-1.5 text-[0.82rem] font-extrabold tracking-[0.08em] text-dim-foreground transition-colors hover:text-highlight"
        >
          <Pencil aria-hidden className="size-3.5" />
          Edit your review
        </Link>
      )}
    </p>
  );
}

export function ReviewBannerScore({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-3 md:block md:text-center">
      <ScoreBox
        rating={rating}
        className="size-[76px] text-[3.25rem] md:size-[150px] md:rounded-md md:text-[6.5rem]"
      />
      <span className="font-label block text-[0.82rem] font-extrabold tracking-[0.1em] text-dim-foreground md:mt-2">
        Out of {MAX_RATING}
      </span>
    </div>
  );
}
