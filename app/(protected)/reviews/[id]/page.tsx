import { notFound } from "next/navigation";

import { ReviewBanner } from "@/components/member/review-banner";
import { ReviewDetail } from "@/components/member/review-detail";
import { ReviewMore } from "@/components/issue/review-more";
import { ReviewVerdict } from "@/components/issue/review-verdict";
import { apiFetch } from "@/lib/api";
import type { ApiSingle, Review } from "@/lib/api/types";
import { reviewHref } from "@/lib/reviews/href";
import { readReviewSurroundings } from "@/lib/reviews/review-page-read";
import { accentForGame } from "@/lib/reviews/accent";
import { editedAt } from "@/lib/reviews/edit-rules";
import { reviewPageMode } from "@/lib/reviews/review-page";
import {
  headlineTitle,
  latestEdit,
  revisedCount,
  reviewTakes,
  revisionTakeFor,
  scoreRow,
} from "@/lib/reviews/takes";
import { ReviewRead } from "@/components/reviews/takes/review-read";
import { ScoreRow } from "@/components/reviews/takes/score-row";
import { getSession, requireFeature } from "@/lib/session";
import { PreviewBadge } from "@/components/feature/preview-badge";
import { DetailTemplate } from "@/components/templates/detail-template";

// A review's own page, read top to bottom like a magazine piece: the cover
// banner with the headline and the current score, the review, the verdict
// (the current overall and facet scores) once it has made its case, and the
// club's other takes on the game last.
//
// The score line (every take newest first on a dated spine, with the score
// row in the banner) only appears once a Revision is published. Until then
// the review reads as one article, and the author's Revisit sits beside
// "Edit your review" in the byline. The author opens a take in the desk from
// here.

export default async function ReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ edit?: string; revision?: string; revisit?: string }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const reviewId = parseInt(id, 10);
  if (isNaN(reviewId)) notFound();

  const [features, reviewRes, session] = await Promise.all([
    requireFeature("reviews"),
    // The running head reads the same URL, so React shares the one fetch.
    apiFetch(`/api/v1/reviews/${reviewId}`, { cache: "no-store" }),
    getSession(),
  ]);
  if (!reviewRes.ok) notFound();
  const { data: review }: ApiSingle<Review> = await reviewRes.json();
  const gameId = review.gamedb_game_id;

  const read = await readReviewSurroundings(review);
  if (!read) notFound();
  const { game, others, otherCount, authorName, now } = read;

  const accent = accentForGame(game);
  const ownerId = session?.principal.discord_id ?? null;
  const isMine = ownerId !== null && ownerId === review.user_id;
  const mode = reviewPageMode(review, query, isMine);
  // While the author edits, the editor's own banner takes the page banner's
  // place, so the game's art shows once.
  const editing = mode.kind !== "read";
  const takes = reviewTakes(review);
  const current = takes[takes.length - 1];
  const owner = isMine ? { userId: review.user_id, reviewId, gameId } : null;
  // A Draft Revision alone doesn't count: readers never see it, and the
  // author continues it from the byline.
  const revised = takes.length > 1;
  // Edit and Revisit sit in the byline until the score line carries them.
  const canRevisit = isMine && !revised;

  return (
    <DetailTemplate
      className="space-y-10 pb-10"
      hero={
        !editing && (
          <ReviewBanner
            game={game}
            accent={accent}
            rating={review.rating}
            scoreHistory={revised ? <ScoreRow stops={scoreRow(takes)} /> : undefined}
            bylineNote={revised ? revisedCount(takes) : null}
            canEdit={canRevisit}
            revisit={canRevisit ? { href: reviewHref(reviewId, { revisit: true }), continuing: !!review.draft_revision } : null}
            authorId={review.user_id}
            authorName={authorName}
            // A Draft finished later reads as reviewed the day it went out.
            createdAt={review.published_at ?? review.created_at}
            editedAt={latestEdit(takes, (t) => editedAt({ published_at: t.publishedAt, edited_at: t.editedAt }))}
            title={headlineTitle(takes)}
            badge={features.preview("reviews") && <PreviewBadge />}
          />
        )
      }
    >
      {/* Reading and editing share the column. The editor has its own
          scorecard, so the verdict lives inside the read view (`children`)
          and steps aside while the review is being edited. */}
      <ReviewDetail
        review={review}
        gameId={gameId}
        game={game}
        accent={accent}
        canEdit={isMine}
        startEditing={editing}
        startRevisit={mode.kind === "start-revisit"}
        revisionTake={revisionTakeFor(mode.kind === "revision" ? mode.revision : null, takes)}
      >
        <div className="space-y-12 pt-2">
          <ReviewRead
            takes={takes}
            body={review.body}
            accent={accent}
            owner={owner}
            draftRevision={isMine ? (review.draft_revision ?? null) : null}
            authorName={authorName}
            now={now}
          />

          {/* The current take's verdict: its score and scorecard. */}
          <ReviewVerdict
            review={{ ...review, rating: current.rating, facets: current.facets }}
            game={game}
            authorName={authorName}
          />
        </div>
      </ReviewDetail>

      <ReviewMore
        gameId={gameId}
        gameTitle={game.title}
        others={others}
        otherCount={otherCount}
      />
    </DetailTemplate>
  );
}
