import Link from "next/link";
import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { getSession } from "@/lib/session";
import type { ApiSingle, Game, Review } from "@/lib/api/types";
import { GameReviewsList } from "@/components/member/game-reviews-list";

export default async function GameReviewDetailPage({
  params,
}: {
  params: Promise<{ id: string; reviewId: string }>;
}) {
  const { id, reviewId } = await params;
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

  const ownerId = session?.principal.discord_id ?? null;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/games" className="hover:text-foreground transition-colors">
          Games
        </Link>
        <span>›</span>
        <Link
          href={`/games/${game.game_id}`}
          className="hover:text-foreground transition-colors"
        >
          {game.title}
        </Link>
        <span>›</span>
        <Link
          href={`/games/${game.game_id}/reviews`}
          className="hover:text-foreground transition-colors"
        >
          Reviews
        </Link>
        <span>›</span>
        <span className="text-foreground">Review</span>
      </div>

      <GameReviewsList
        gameId={gameId}
        reviews={[review]}
        ownerId={ownerId}
        showComposeCta={false}
        showFullBody
      />
    </div>
  );
}
