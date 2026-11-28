import type { ReactNode } from "react";
import type { Game, Review } from "@/lib/api/types";
import type { ViewerOnGame } from "@/lib/games/viewer";
import { accentForGame } from "@/lib/reviews/accent";
import { ReviewQuotes } from "@/components/issue/review-quotes";
import { GameReviewsList } from "@/components/games/reviews/game-reviews-list";
import { ReviewsGameAside } from "@/components/games/reviews/reviews-game-aside";

// The reviews page's list: the game's cover and the write-a-review panel in a
// left column, the reviews as cards beside it, and a row of pull quotes
// under them.
export function ReviewsListView({
  gameId,
  game,
  strip,
  reviews,
  listFailed,
  total,
  currentPage,
  totalPages,
  viewer,
  composing,
  listHref,
  readerHrefs,
  pagination,
  composePanel,
}: {
  gameId: number;
  game: Game;
  strip: ReactNode;
  reviews: Review[];
  listFailed: boolean;
  total: number;
  currentPage: number;
  totalPages: number;
  viewer: ViewerOnGame;
  // `?compose`: the composer opens at the top of the list.
  composing: boolean;
  // This page of the list, where closing the composer goes.
  listHref: string;
  readerHrefs: Record<number, string>;
  pagination: ReactNode;
  composePanel: ReactNode;
}) {
  return (
    <div className="pb-10">
      {strip}
      <div className="mt-6 grid gap-8 lg:grid-cols-[18.75rem_minmax(0,1fr)]">
        <ReviewsGameAside gameId={gameId} game={game} composePanel={composePanel} />

        <div className="min-w-0 space-y-10">
          <div>
            <header className="mb-4.5 flex flex-wrap items-end gap-x-4 gap-y-1 border-b-2 border-foreground pb-3">
              <h1 className="font-headline text-[2.9rem] leading-[0.85] md:text-[4rem]">
                Reviews
              </h1>
              <p className="font-label pb-1 text-[0.95rem] font-extrabold tracking-[0.08em] text-faint-foreground">
                {total} {total === 1 ? "review" : "reviews"}
                {totalPages > 1 && ` · page ${currentPage} of ${totalPages}`}
              </p>
            </header>

            {listFailed ? (
              <p data-slot="shelf-empty" className="rounded-md border border-dashed border-border-strong px-4 py-8 text-center text-sm text-faint-foreground">
                Reviews couldn&apos;t be loaded right now.
              </p>
            ) : (
              <GameReviewsList
                gameId={gameId}
                reviews={reviews}
                ownerId={viewer.ownerId}
                canWriteReview={viewer.canWriteReview}
                viewerStatus={viewer.status}
                accent={accentForGame(game)}
                layout="cards"
                showCompose={false}
                startComposing={composing && viewer.canWriteReview}
                composeCloseHref={listHref}
                reviewHrefs={readerHrefs}
              />
            )}

            <div className="mt-7">{pagination}</div>
          </div>

          <ReviewQuotes reviews={reviews} hrefs={readerHrefs} />
        </div>
      </div>
    </div>
  );
}
