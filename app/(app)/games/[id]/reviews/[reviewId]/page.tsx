import { notFound } from "next/navigation";

import { ReviewBanner } from "@/components/member/review-banner";
import { ReviewBodyContent } from "@/components/member/review-body";
import { ReviewDetail } from "@/components/member/review-detail";
import { ReviewMore } from "@/components/issue/review-more";
import { reviewerName } from "@/components/issue/review-meta";
import { ReviewVerdict } from "@/components/issue/review-verdict";
import { apiFetch } from "@/lib/api";
import { paginationOf } from "@/lib/api/pagination";
import { reviewBodyText } from "@/lib/api/review-body";
import type {
  ApiCollection,
  ApiSingle,
  Game,
  Review,
  User,
} from "@/lib/api/types";
import { accentForGame } from "@/lib/reviews/accent";
import { getSession } from "@/lib/session";

// A review's own page, read top to bottom like a magazine piece: the cover
// banner with the headline and the score, the review as an article column,
// the verdict (overall and the facet scores) once it has made its case, and
// the club's other takes on the game last.

const MORE_SHOWN = 4;

export default async function GameReviewDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; reviewId: string }>;
  searchParams: Promise<{ edit?: string }>;
}) {
  const [{ id, reviewId }, { edit }] = await Promise.all([
    params,
    searchParams,
  ]);
  const gameId = parseInt(id, 10);
  const numericReviewId = parseInt(reviewId, 10);
  if (isNaN(gameId) || isNaN(numericReviewId)) notFound();

  const [reviewRes, gameRes, session, othersRes] = await Promise.all([
    apiFetch(`/api/v1/reviews/${numericReviewId}`, { cache: "no-store" }),
    apiFetch(`/api/v1/games/${gameId}`, { cache: "no-store" }),
    getSession(),
    // One more than shown, so the current review can drop out and still
    // leave a full row.
    apiFetch(`/api/v1/games/${gameId}/reviews?per=${MORE_SHOWN + 1}`, {
      cache: "no-store",
    }),
  ]);

  if (!reviewRes.ok || !gameRes.ok) notFound();
  const { data: review }: ApiSingle<Review> = await reviewRes.json();
  const { data: game }: ApiSingle<Game> = await gameRes.json();

  // Defensive — the URL might point at a review for a different game.
  if (review.gamedb_game_id !== gameId) notFound();

  // The single-review endpoint renders the row's own columns and embeds no
  // author, so the byline needs its own read. It depends on the review, so it
  // can't join the batch above.
  const authorRes = await apiFetch(`/api/v1/users/${review.user_id}`, {
    cache: "no-store",
  });
  const author: User | null = authorRes.ok
    ? ((await authorRes.json()) as ApiSingle<User>).data
    : null;
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
  const hasBody = reviewBodyText(review.body) !== null;

  return (
    <div className="space-y-10 pb-10">
      <ReviewBanner
        game={game}
        accent={accent}
        rating={review.rating}
        authorId={review.user_id}
        authorName={authorName}
        createdAt={review.created_at}
        canEdit={isMine}
        title={review.title}
      />

      {/* Reading and editing share the column. The editor has its own
          scorecard, so the verdict lives inside the read view (`children`)
          and steps aside while the review is being edited. */}
      <ReviewDetail
        review={review}
        gameId={gameId}
        accent={accent}
        canEdit={isMine}
        startEditing={edit !== undefined}
      >
        <div className="space-y-12">
          <article aria-label="Review" className="max-w-[68ch] md:px-1">
            {hasBody ? (
              <ReviewBodyContent body={review.body} variant="article" />
            ) : (
              <p className="text-paper-mute italic">
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
    </div>
  );
}
