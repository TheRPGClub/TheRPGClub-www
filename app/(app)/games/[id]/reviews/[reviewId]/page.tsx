import Link from "next/link";
import { notFound } from "next/navigation";

import { ReviewBanner } from "@/components/member/review-banner";
import { ReviewBodyContent } from "@/components/member/review-body";
import { ReviewDetail } from "@/components/member/review-detail";
import { ReviewScorecard } from "@/components/member/review-scorecard";
import { apiFetch } from "@/lib/api";
import { reviewBodyText } from "@/lib/api/review-body";
import type { ApiSingle, Game, Review, User } from "@/lib/api/types";
import { accentForGame } from "@/lib/reviews/accent";
import { getSession } from "@/lib/session";

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

  const [reviewRes, gameRes, session] = await Promise.all([
    apiFetch(`/api/v1/reviews/${numericReviewId}`, { cache: "no-store" }),
    apiFetch(`/api/v1/games/${gameId}`, { cache: "no-store" }),
    getSession(),
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
  const authorName = author?.global_name ?? author?.username ?? review.user_id;

  const accent = accentForGame(game);
  const ownerId = session?.principal.discord_id ?? null;
  const isMine = ownerId !== null && ownerId === review.user_id;
  const hasBody = reviewBodyText(review.body) !== null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/games" className="transition-colors hover:text-foreground">
          Games
        </Link>
        <span>›</span>
        <Link
          href={`/games/${game.game_id}`}
          className="transition-colors hover:text-foreground"
        >
          {game.title}
        </Link>
        <span>›</span>
        <Link
          href={`/games/${game.game_id}/reviews`}
          className="transition-colors hover:text-foreground"
        >
          Reviews
        </Link>
        <span>›</span>
        <span className="text-foreground">{authorName}</span>
      </div>

      <ReviewBanner
        game={game}
        accent={accent}
        rating={review.rating}
        authorId={review.user_id}
        authorName={authorName}
        createdAt={review.created_at}
      />

      {/* The review runs the full width of the column, reading and editing
          alike — this page exists so it isn't squeezed into a card on the
          game page. */}
      <ReviewDetail
        review={review}
        gameId={gameId}
        accent={accent}
        canEdit={isMine}
        startEditing={edit !== undefined}
      >
        {/* Inside `children`, so it belongs to the read view — the editor
            branch has a scorecard of its own and must not show two. The
            numbers group under the banner's overall, then the prose runs. */}
        <ReviewScorecard
          facets={review.facets}
          accent={accent}
          overall={review.rating}
          variant="full"
          className="mb-8"
        />

        {hasBody ? (
          <ReviewBodyContent
            body={review.body}
            className="text-base leading-[1.75]"
          />
        ) : (
          <p className="text-base text-muted-foreground italic">
            {isMine
              ? "You scored this game but haven't written anything yet."
              : `${authorName} scored this game without writing a review.`}
          </p>
        )}
      </ReviewDetail>
    </div>
  );
}
