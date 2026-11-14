import { notFound } from "next/navigation";
import { loadReviewsPage, loadSelectedReview } from "@/lib/games/reviews-page";
import { reviewsPageHrefs } from "@/lib/games/reviews-hrefs";
import { viewerOnGame } from "@/lib/games/viewer";
import { PreviewBadge } from "@/components/feature/preview-badge";
import { ListPagination } from "@/components/list-pagination";
import { GameStrip } from "@/components/issue/game-strip";
import { ReviewComposePanel } from "@/components/issue/review-compose-panel";
import { ReviewsListView } from "@/components/games/reviews/reviews-list-view";
import { ReviewsReader } from "@/components/games/reviews/reviews-reader";

// A game's reviews, in two states on one URL.
//
// The list: the game's cover and the write-a-review panel in a left column,
// the reviews as cards beside it, and a row of pull quotes under them.
//
// The reader (`?review=<id>`): the chosen review opens in full on the right
// while the page's reviews stay listed on the left. It's a URL, so a review
// is linkable and Back returns to the list. `?page` survives both ways, and
// `?compose` opens the composer at the top of the list.

export default async function GameReviewsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string; review?: string; compose?: string }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const gameId = parseInt(id, 10);
  if (isNaN(gameId)) notFound();

  const currentPage = Math.max(1, parseInt(query.page ?? "1", 10) || 1);
  const selectedId = query.review ? parseInt(query.review, 10) : NaN;
  const composing = query.compose !== undefined;

  const page = await loadReviewsPage(gameId, currentPage);
  if (!page) notFound();
  const { features, game, session, reviews, total, totalPages } = page;

  const hrefs = reviewsPageHrefs(gameId, currentPage);
  const readerHrefs = Object.fromEntries(
    reviews.map((r) => [r.review_id, hrefs.reader(r.review_id)]),
  );
  const viewer = viewerOnGame(game, session?.principal.discord_id ?? null);
  const ownOnPage = reviews.some((r) => r.user_id === viewer.ownerId);
  const selected = Number.isNaN(selectedId)
    ? null
    : await loadSelectedReview(selectedId, gameId, reviews);

  const composePanel = viewer.ownerId &&
    !ownOnPage &&
    !(composing && !selected && viewer.canWriteReview) && (
      <ReviewComposePanel
        ownerId={viewer.ownerId}
        canWriteReview={viewer.canWriteReview}
        status={viewer.status}
        href={hrefs.compose}
        variant="stack"
      />
    );
  const frame = {
    game,
    reviews,
    total,
    currentPage,
    totalPages,
    readerHrefs,
    composePanel,
    strip: <GameStrip game={game} badge={features.preview("reviews") && <PreviewBadge />} />,
    pagination: (
      <ListPagination
        currentPage={currentPage}
        totalPages={totalPages}
        buildHref={(p) => (selected ? hrefs.reader(selected.review.review_id, p) : hrefs.list(p))}
      />
    ),
  };

  return selected ? (
    <ReviewsReader
      {...frame}
      selected={selected}
      backHref={hrefs.list(currentPage)}
      isMine={viewer.ownerId === selected.review.user_id}
    />
  ) : (
    <ReviewsListView
      {...frame}
      gameId={gameId}
      listFailed={page.listFailed}
      viewer={viewer}
      composing={composing}
      listHref={hrefs.list(currentPage)}
    />
  );
}
