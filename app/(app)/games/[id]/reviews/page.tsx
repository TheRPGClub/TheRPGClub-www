import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { accentForGame } from "@/lib/reviews/accent";
import { getSession } from "@/lib/session";
import type {
  ApiCollection,
  ApiSingle,
  Game,
  Review,
  User,
} from "@/lib/api/types";
import { paginationOf } from "@/lib/api/pagination";
import { GameReviewsList } from "@/components/member/game-reviews-list";
import { ListPagination } from "@/components/list-pagination";
import { Chip } from "@/components/issue/chip";
import { GameCover, GameHeadline } from "@/components/issue/game-cover";
import { GameStrip } from "@/components/issue/game-strip";
import { gameTrack, trackAccentText, trackChips } from "@/components/issue/game-track";
import { ReviewComposePanel } from "@/components/issue/review-compose-panel";
import { ReviewIndex } from "@/components/issue/review-index";
import { reviewerName } from "@/components/issue/review-meta";
import { ReviewQuotes } from "@/components/issue/review-quotes";
import { ReviewReader } from "@/components/issue/review-reader";

// A game's reviews, in two states on one URL.
//
// The list: the game's cover and the write-a-review panel in a left column,
// the reviews as cards beside it, and a row of pull quotes under them.
//
// The reader (`?review=<id>`): the chosen review opens in full on the right
// while the page's reviews stay listed on the left. It's a URL, so a review
// is linkable and Back returns to the list. `?page` survives both ways, and
// `?compose` opens the composer at the top of the list.

const PAGE_SIZE = 10;

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

  const [gameRes, session, listRes] = await Promise.all([
    apiFetch(`/api/v1/games/${gameId}`, { cache: "no-store" }),
    getSession(),
    apiFetch(
      `/api/v1/games/${gameId}/reviews?per=${PAGE_SIZE}&page=${currentPage}`,
      { cache: "no-store" },
    ),
  ]);

  if (!gameRes.ok) notFound();
  const { data: game }: ApiSingle<Game> = await gameRes.json();

  let reviews: Review[] = [];
  let total = 0;
  let totalPages = 1;
  const listFailed = !listRes.ok;
  if (listRes.ok) {
    const body: ApiCollection<Review> = await listRes.json();
    reviews = body.data;
    // The server owns the split; PAGE_SIZE is only what we asked for.
    const pagination = paginationOf(body.meta, reviews.length);
    total = pagination.total;
    totalPages = pagination.totalPages;
  }

  // URLs. Page 1 stays bare; the reader keeps the page it was opened from.
  const base = `/games/${gameId}/reviews`;
  const listHref = (page: number) => (page > 1 ? `${base}?page=${page}` : base);
  const readerHref = (reviewId: number, page = currentPage) =>
    `${base}?${page > 1 ? `page=${page}&` : ""}review=${reviewId}`;
  const hrefs = Object.fromEntries(
    reviews.map((r) => [r.review_id, readerHref(r.review_id)]),
  );

  const ownerId = session?.principal.discord_id ?? null;
  const isPlaying =
    !!ownerId && (game.now_playing ?? []).some((e) => e.user_id === ownerId);
  const hasCompleted =
    !!ownerId && (game.completions ?? []).some((e) => e.user_id === ownerId);
  const canWriteReview = isPlaying || hasCompleted;
  const viewerStatus = isPlaying ? "playing" : hasCompleted ? "completed" : null;
  const ownOnPage = ownerId
    ? reviews.some((r) => r.user_id === ownerId)
    : false;

  const selected = Number.isNaN(selectedId)
    ? null
    : await loadSelected(selectedId, gameId, reviews);

  const composePanel = ownerId && !ownOnPage && !(composing && !selected && canWriteReview) && (
    <ReviewComposePanel
      ownerId={ownerId}
      canWriteReview={canWriteReview}
      status={viewerStatus}
      href={`${listHref(currentPage)}${currentPage > 1 ? "&" : "?"}compose=1#compose`}
      variant="stack"
    />
  );

  const pagination = (
    <ListPagination
      currentPage={currentPage}
      totalPages={totalPages}
      buildHref={(p) =>
        selected ? readerHref(selected.review.review_id, p) : listHref(p)
      }
    />
  );

  const strip = <GameStrip game={game} crumbs={[{ label: "Reviews" }]} />;

  // ---- Reader --------------------------------------------------------------
  if (selected) {
    const index = reviews.findIndex(
      (r) => r.review_id === selected.review.review_id,
    );
    const neighbour = (r: Review | undefined) =>
      r
        ? {
            href: readerHref(r.review_id),
            title: r.title ?? `${reviewerName(r.user, "A member")}'s review`,
          }
        : null;

    return (
      <div className="pb-10">
        {strip}
        <div className="mt-6 grid gap-8 lg:grid-cols-[21rem_minmax(0,1fr)] xl:grid-cols-[23.75rem_minmax(0,1fr)]">
          <aside
            aria-label="All reviews"
            className="order-2 lg:sticky lg:top-20 lg:order-1 lg:self-start"
          >
            <div className="mb-3 flex items-baseline gap-2.5">
              <h1 className="font-headline text-[2.6rem] leading-[0.9]">
                Reviews
              </h1>
              <span className="font-headline text-2xl text-paper-mute">
                {total}
              </span>
              {totalPages > 1 && (
                <span className="font-label ml-auto text-[0.8rem] text-paper-mute">
                  Page {currentPage} of {totalPages}
                </span>
              )}
            </div>
            <ReviewIndex
              reviews={reviews}
              hrefs={hrefs}
              activeId={selected.review.review_id}
            />
            <div className="mt-4">{pagination}</div>
            {composePanel && <div className="mt-4">{composePanel}</div>}
          </aside>

          <div className="order-1 lg:order-2">
            <ReviewReader
              review={selected.review}
              game={game}
              authorName={selected.authorName}
              backHref={listHref(currentPage)}
              newer={index > 0 ? neighbour(reviews[index - 1]) : null}
              older={
                index >= 0 && index < reviews.length - 1
                  ? neighbour(reviews[index + 1])
                  : null
              }
              isMine={ownerId === selected.review.user_id}
            />
          </div>
        </div>
      </div>
    );
  }

  // ---- List ----------------------------------------------------------------
  const track = gameTrack(game);
  const year = game.initial_release_date
    ? new Date(game.initial_release_date).getUTCFullYear()
    : null;
  const meta = [
    year,
    ...(game.platforms ?? [])
      .slice(0, 4)
      .map((p) => p.platform_abbreviation ?? p.platform_code ?? p.platform_name),
  ].filter(Boolean);
  const winChip = trackChips(game, { short: true })[0];

  return (
    <div className="pb-10">
      {strip}
      <div className="mt-6 grid gap-8 lg:grid-cols-[18.75rem_minmax(0,1fr)]">
        <aside
          aria-label={game.title}
          className="grid grid-cols-[5.75rem_1fr] items-center gap-x-3.5 gap-y-4 lg:sticky lg:top-20 lg:block lg:self-start"
        >
          <div className="relative">
            <GameCover
              title={game.title}
              coverUrl={game.cover_url}
              className="rounded-md shadow-[0_18px_40px_rgb(0_0_0/0.5)]"
              fallbackClassName="text-sm lg:text-[2rem]"
            />
            {winChip && (
              <Chip tone={winChip.tone} className="absolute bottom-3 left-3 hidden lg:inline-flex">
                {winChip.label}
              </Chip>
            )}
          </div>
          <div className="min-w-0">
            <GameHeadline
              as="h2"
              title={game.title}
              accentClassName={trackAccentText(track)}
              className="text-[1.75rem] leading-[0.9] lg:mt-4 lg:text-[2.4rem]"
            />
            {meta.length > 0 && (
              <p className="font-label mt-2 text-[0.85rem] tracking-[0.06em] text-paper-mute">
                {meta.join(" · ")}
              </p>
            )}
          </div>
          {composePanel && (
            <div className="col-span-full lg:mt-4.5">{composePanel}</div>
          )}
          <Link
            href={`/games/${gameId}`}
            className="font-label col-span-full hidden items-center gap-1.5 text-[0.85rem] font-extrabold tracking-[0.08em] text-paper-dim transition-colors hover:text-highlight lg:mt-3.5 lg:inline-flex [&_svg]:size-3.5"
          >
            <ArrowLeft aria-hidden />
            Back to the game
          </Link>
        </aside>

        <div className="min-w-0 space-y-10">
          <div>
            <header className="mb-4.5 flex flex-wrap items-end gap-x-4 gap-y-1 border-b-2 border-paper pb-3">
              <h1 className="font-headline text-[2.9rem] leading-[0.85] md:text-[4rem]">
                Reviews
              </h1>
              <p className="font-label pb-1 text-[0.95rem] font-extrabold tracking-[0.08em] text-paper-mute">
                {total} {total === 1 ? "review" : "reviews"}
                {totalPages > 1 && ` · page ${currentPage} of ${totalPages}`}
              </p>
            </header>

            {listFailed ? (
              <p className="rounded-md border border-dashed border-rule-strong px-4 py-8 text-center text-sm text-paper-mute">
                Reviews couldn&apos;t be loaded right now.
              </p>
            ) : (
              <GameReviewsList
                gameId={gameId}
                reviews={reviews}
                ownerId={ownerId}
                canWriteReview={canWriteReview}
                viewerStatus={viewerStatus}
                accent={accentForGame(game)}
                layout="cards"
                showCompose={false}
                startComposing={composing && canWriteReview}
                composeCloseHref={listHref(currentPage)}
                reviewHrefs={hrefs}
              />
            )}

            <div className="mt-7">{pagination}</div>
          </div>

          <ReviewQuotes reviews={reviews} hrefs={hrefs} />
        </div>
      </div>
    </div>
  );
}

// The open review: from the page already read when it's on it, otherwise its
// own read (a shared link can point at any page's review). The single-review
// endpoint embeds no author, so that read fetches the byline too.
async function loadSelected(
  reviewId: number,
  gameId: number,
  onPage: Review[],
): Promise<{ review: Review; authorName: string } | null> {
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
  const authorRes = await apiFetch(`/api/v1/users/${review.user_id}`, {
    cache: "no-store",
  });
  const author: User | null = authorRes.ok
    ? ((await authorRes.json()) as ApiSingle<User>).data
    : null;
  return { review, authorName: reviewerName(author, "A member") };
}
