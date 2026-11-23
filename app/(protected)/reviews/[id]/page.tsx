import { notFound } from "next/navigation";

import { ReviewBanner } from "@/components/member/review-banner";
import { ReviewBodyContent } from "@/components/member/review-body";
import { ReviewDetail } from "@/components/member/review-detail";
import { ReviewMore } from "@/components/issue/review-more";
import { reviewerName } from "@/lib/reviews/reviewer-name";
import { ReviewVerdict } from "@/components/issue/review-verdict";
import { apiFetch } from "@/lib/api";
import { paginationOf } from "@/lib/api/pagination";
import { reviewBodyText } from "@/lib/api/review-body";
import type {
  ApiCollection,
  ApiSingle,
  Game,
  Review,
} from "@/lib/api/types";
import { fetchAuthor } from "@/lib/games/reviews-page";
import { accentForGame } from "@/lib/reviews/accent";
import { getSession, requireFeature } from "@/lib/session";
import { PreviewBadge } from "@/components/feature/preview-badge";
import { DetailTemplate } from "@/components/templates/detail-template";

// A review's own page, read top to bottom like a magazine piece: the cover
// banner with the headline and the score, the review as an article column,
// the verdict (overall and the facet scores) once it has made its case, and
// the club's other takes on the game last.

const MORE_SHOWN = 4;

export default async function ReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ edit?: string }>;
}) {
  const [{ id }, { edit }] = await Promise.all([params, searchParams]);
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

  // The single-review endpoint renders the row's own columns and embeds no
  // author, so the byline needs its own read.
  const [gameRes, othersRes, author] = await Promise.all([
    apiFetch(`/api/v1/games/${gameId}`, { cache: "no-store" }),
    // One more than shown, so the current review can drop out and still
    // leave a full row.
    apiFetch(`/api/v1/games/${gameId}/reviews?per=${MORE_SHOWN + 1}`, {
      cache: "no-store",
    }),
    fetchAuthor(review.user_id),
  ]);
  if (!gameRes.ok) notFound();
  const { data: game }: ApiSingle<Game> = await gameRes.json();

  const authorName = reviewerName(author, review.user_id);

  let others: Review[] = [];
  let otherCount = 0;
  if (othersRes.ok) {
    const body: ApiCollection<Review> = await othersRes.json();
    others = body.data
      .filter((r) => r.review_id !== review.review_id)
      .slice(0, MORE_SHOWN);
    const total = paginationOf(body.meta, body.data.length).total;
    otherCount = Math.max(0, total - 1);
  }

  const accent = accentForGame(game);
  const ownerId = session?.principal.discord_id ?? null;
  const isMine = ownerId !== null && ownerId === review.user_id;
  // While the author edits, the editor's own banner takes the page banner's
  // place, so the game's art shows once.
  const editing = isMine && edit !== undefined;
  const hasBody = reviewBodyText(review.body) !== null;

  return (
    <DetailTemplate
      className="space-y-10 pb-10"
      hero={
        !editing && (
          <ReviewBanner
            game={game}
            accent={accent}
            rating={review.rating}
            authorId={review.user_id}
            authorName={authorName}
            createdAt={review.created_at}
            canEdit={isMine}
            title={review.title}
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
        startEditing={edit !== undefined}
      >
        <div className="space-y-12">
          <article aria-label="Review" className="max-w-[68ch] md:px-1">
            {hasBody ? (
              <ReviewBodyContent body={review.body} variant="article" />
            ) : (
              <p className="text-faint-foreground italic">
                {isMine
                  ? "You scored this game but haven't written anything yet."
                  : `${authorName} scored this game without writing a review.`}
              </p>
            )}
          </article>

          <ReviewVerdict review={review} game={game} authorName={authorName} />
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
