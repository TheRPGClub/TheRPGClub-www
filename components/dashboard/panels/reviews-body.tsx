import { ageLabel } from "@/lib/dashboard/panel-items";
import { readReviews } from "@/lib/dashboard/panel-sources";
import { PANELS } from "@/lib/dashboard/panels";
import { ScoreBox } from "@/components/issue/review-meta";
import { MetaParts, PanelItem } from "./panel-list";
import { listBody, memberOf, RowCover } from "./body-kit";
import type { BodyProps } from "./panel-body";
import { reviewHref } from "@/lib/reviews/href";

// Latest Reviews: the club's newest Published Reviews and Revisions (the
// Review Feed's head), each with its reviewer on the cover's corner and its
// score as the paper block reviews wear. A Revision opens at its own stop.
export async function ReviewsBody({ wide }: BodyProps) {
  const reviews = await readReviews();
  const now = Date.now();
  return listBody({
    rows: reviews,
    title: PANELS.reviews.title,
    wide,
    row: (review) => {
      const member = memberOf(review.user);
      const title = review.title?.trim();
      return (
        <PanelItem
          key={review.revision_id != null ? `revision-${review.revision_id}` : `review-${review.review_id}`}
          media={<RowCover title={review.game.title} coverUrl={review.game.cover_url} member={member} />}
          title={title || review.game.title}
          href={reviewHref(review.review_id, { take: review.revision_id ?? undefined })}
          meta={<MetaParts parts={[<b key="m">{member.name}</b>, title && review.game.title, ageLabel(review.published_at, now)]} />}
          aside={<ScoreBox rating={review.rating} className="size-9 text-xl" />}
        />
      );
    },
  });
}
