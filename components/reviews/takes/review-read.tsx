import { ReviewBodyContent } from "@/components/member/review-body";
import { reviewBodyText } from "@/lib/api/review-body";
import type { ReviewBody, ReviewRevision } from "@/lib/api/types";
import type { ReviewAccent } from "@/lib/reviews/accent";
import type { Take } from "@/lib/reviews/takes";
import { ReviewTakes } from "./review-takes";

// The review's reading column: the score line once a Revision is published,
// one plain article before that.
export function ReviewRead({
  takes,
  body,
  accent,
  owner,
  draftRevision,
  authorName,
  now,
}: {
  takes: Take[];
  body: ReviewBody;
  accent: ReviewAccent;
  owner: { userId: string; reviewId: number; gameId: number } | null;
  draftRevision: ReviewRevision | null;
  authorName: string;
  now: number;
}) {
  if (takes.length > 1) {
    return (
      <ReviewTakes
        takes={takes}
        accent={accent}
        owner={owner}
        draftRevision={draftRevision}
        authorName={authorName}
        now={now}
      />
    );
  }
  return <ReviewArticle body={body} isMine={owner !== null} authorName={authorName} />;
}

// A Review with a single take reads as one article, with no score line: the
// spine and its stops only appear once a Revision is published.
export function ReviewArticle({
  body,
  isMine,
  authorName,
}: {
  body: ReviewBody;
  isMine: boolean;
  authorName: string;
}) {
  return (
    <article data-slot="review-read" aria-label="Review" className="max-w-[68ch] md:px-1">
      {reviewBodyText(body) !== null ? (
        <ReviewBodyContent body={body} variant="article" />
      ) : (
        <p className="text-faint-foreground italic">
          {isMine
            ? "You scored this game but haven't written anything yet."
            : `${authorName} scored this game without writing a review.`}
        </p>
      )}
    </article>
  );
}
