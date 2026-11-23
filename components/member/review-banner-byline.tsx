import { Pencil, PencilLine, RotateCcw } from "lucide-react";
import Link from "next/link";

import {
  ReviewerAvatar,
  ScoreBox,
  formatReviewDate,
} from "@/components/issue/review-meta";
import { MAX_RATING } from "@/lib/api/rating";

// The review banner's byline (the reviewer, when they reviewed, and the
// author's "Edit your review" and, until a Revision is published, "Revisit")
// and its score in a paper block.

export function ReviewBannerByline({
  authorId,
  authorName,
  createdAt,
  editedAt,
  canEdit,
  revisit,
  note,
}: {
  authorId: string;
  authorName: string;
  createdAt?: string | null;
  // "Edited <date>", shown to every reader once the review was changed
  // more than an hour after publishing.
  editedAt?: string | null;
  canEdit?: boolean;
  // The author's Revisit, beside Edit while the Review has a single take
  // (the score line carries it once there are more). `continuing` when a
  // Draft Revision is already waiting.
  revisit?: { href: string; continuing: boolean } | null;
  // After the date, e.g. "revisited twice".
  note?: string | null;
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
        {note && ` · ${note}`}
      </span>
      {editedAt && (
        <span className="font-label inline-flex items-center gap-1.5 text-[0.76rem] font-extrabold tracking-[0.08em] text-faint-foreground uppercase">
          <PencilLine aria-hidden className="size-3.25" />
          Edited <time dateTime={editedAt}>{formatReviewDate(editedAt)}</time>
        </span>
      )}
      {canEdit && (
        <Link
          href="?edit=1"
          className="font-label ml-1.5 inline-flex items-center gap-1.5 text-[0.82rem] font-extrabold tracking-[0.08em] text-dim-foreground transition-colors hover:text-highlight"
        >
          <Pencil aria-hidden className="size-3.5" />
          Edit your review
        </Link>
      )}
      {canEdit && revisit && (
        <Link
          href={revisit.href}
          className="font-label inline-flex items-center gap-1.5 text-[0.82rem] font-extrabold tracking-[0.08em] text-dim-foreground transition-colors hover:text-highlight"
        >
          <RotateCcw aria-hidden className="size-3.5" />
          {revisit.continuing ? "Continue your revision" : "Revisit"}
        </Link>
      )}
    </p>
  );
}

// `history` is the score row of a revisited Review, under the score (beside
// it on a phone, where "Out of 100" makes room for it).
export function ReviewBannerScore({ rating, history }: { rating: number; history?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3.5 md:flex-col md:gap-0">
      <ScoreBox
        rating={rating}
        className="size-[76px] text-[3.25rem] md:size-[150px] md:rounded-md md:text-[6.5rem]"
      />
      <span
        className={`font-label text-[0.82rem] font-extrabold tracking-[0.1em] text-dim-foreground md:mt-2 md:block ${history ? "hidden" : "block"}`}
      >
        Out of {MAX_RATING}
      </span>
      {history}
    </div>
  );
}
