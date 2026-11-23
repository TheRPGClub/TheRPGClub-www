import { apiFetch } from "@/lib/api";
import type { ApiCollection, ApiSingle, Game, Review, User } from "@/lib/api/types";
import { paginationOf } from "@/lib/api/pagination";
import { getSession, requireFeature } from "@/lib/session";
import { reviewerName } from "@/lib/reviews/reviewer-name";
import { draftOfGame } from "@/lib/reviews/drafts";
import { fetchOwnDrafts } from "@/lib/reviews/drafts-read";

// The game's reviews page reads: the game, one page of its reviews, and the
// review open in the reader.

export const REVIEWS_PAGE_SIZE = 10;

// Null when the game can't be read (the page is then a 404). A failed list
// read leaves the page up with `listFailed`.
export async function loadReviewsPage(gameId: number, currentPage: number) {
  const sessionRead = getSession();
  const [features, gameRes, session, listRes, drafts] = await Promise.all([
    requireFeature("reviews"),
    apiFetch(`/api/v1/games/${gameId}`, { cache: "no-store" }),
    sessionRead,
    apiFetch(
      `/api/v1/games/${gameId}/reviews?per=${REVIEWS_PAGE_SIZE}&page=${currentPage}`,
      { cache: "no-store" },
    ),
    // The viewer's own Draft of this game takes the compose prompt's place.
    sessionRead.then((s) =>
      s ? fetchOwnDrafts(s.principal.discord_id, { gameId, per: 5 }) : null,
    ),
  ]);
  if (!gameRes.ok) return null;
  const { data: game }: ApiSingle<Game> = await gameRes.json();

  let reviews: Review[] = [];
  let total = 0;
  let totalPages = 1;
  if (listRes.ok) {
    const body: ApiCollection<Review> = await listRes.json();
    reviews = body.data;
    // The server owns the split; the page size is only what we asked for.
    const pagination = paginationOf(body.meta, reviews.length);
    total = pagination.total;
    totalPages = pagination.totalPages;
  }
  const draft = drafts ? draftOfGame(drafts.drafts, gameId) : null;
  return {
    features,
    game,
    session,
    reviews,
    total,
    totalPages,
    listFailed: !listRes.ok,
    ownDraft: draft && drafts ? { draft, now: drafts.now } : null,
  };
}

export interface SelectedReview {
  review: Review;
  authorName: string;
}

// The open review: from the page already read when it's on it, otherwise its
// own read (a shared link can point at any page's review). The single-review
// endpoint embeds no author, so that read fetches the byline too.
export async function loadSelectedReview(
  reviewId: number,
  gameId: number,
  onPage: Review[],
): Promise<SelectedReview | null> {
  const found = onPage.find((r) => r.review_id === reviewId);
  if (found) {
    return { review: found, authorName: reviewerName(found.user, "A member") };
  }
  const res = await apiFetch(`/api/v1/reviews/${reviewId}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  const { data: review }: ApiSingle<Review> = await res.json();
  // Defensive — the id might belong to another game's review.
  if (review.gamedb_game_id !== gameId) return null;
  return { review, authorName: reviewerName(await fetchAuthor(review.user_id), "A member") };
}

// A review's author, for the byline the single-review endpoint leaves out.
export async function fetchAuthor(userId: string): Promise<User | null> {
  const res = await apiFetch(`/api/v1/users/${userId}`, { cache: "no-store" });
  return res.ok ? ((await res.json()) as ApiSingle<User>).data : null;
}
