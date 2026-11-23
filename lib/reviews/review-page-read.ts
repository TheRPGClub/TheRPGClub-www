import { apiFetch } from "@/lib/api";
import { paginationOf } from "@/lib/api/pagination";
import type { ApiCollection, ApiSingle, Game, Review } from "@/lib/api/types";
import { fetchAuthor } from "@/lib/games/reviews-page";
import { reviewerName } from "@/lib/reviews/reviewer-name";

const MORE_SHOWN = 4;

// What a review's own page reads around the review: its game, the club's
// other reviews of it (the review itself left out), and the author's name
// (the single-review endpoint embeds no author). Null when the game can't be
// read. `now` is the read's clock, for "saved 2 min ago".
export async function readReviewSurroundings(review: Review): Promise<{
  game: Game;
  others: Review[];
  otherCount: number;
  authorName: string;
  now: number;
} | null> {
  const gameId = review.gamedb_game_id;
  const [gameRes, othersRes, author] = await Promise.all([
    apiFetch(`/api/v1/games/${gameId}`, { cache: "no-store" }),
    // One more than shown, so the current review can drop out and still
    // leave a full row.
    apiFetch(`/api/v1/games/${gameId}/reviews?per=${MORE_SHOWN + 1}`, { cache: "no-store" }),
    fetchAuthor(review.user_id),
  ]);
  if (!gameRes.ok) return null;
  const { data: game }: ApiSingle<Game> = await gameRes.json();

  let others: Review[] = [];
  let otherCount = 0;
  if (othersRes.ok) {
    const body: ApiCollection<Review> = await othersRes.json();
    others = body.data.filter((r) => r.review_id !== review.review_id).slice(0, MORE_SHOWN);
    const total = paginationOf(body.meta, body.data.length).total;
    otherCount = Math.max(0, total - 1);
  }
  return { game, others, otherCount, authorName: reviewerName(author, review.user_id), now: Date.now() };
}
