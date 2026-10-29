import Link from "next/link";
import { MAX_RATING } from "@/lib/api/rating";
import type { Game, Review } from "@/lib/api/types";
import { Chip } from "@/components/issue/chip";
import { GameCover } from "@/components/issue/game-cover";
import { trackChips } from "@/components/issue/game-track";
import {
  ReviewerAvatar,
  facetFill,
  formatReviewDate,
  scoredFacets,
} from "@/components/issue/review-meta";
import { cn } from "@/lib/utils";

// The verdict that closes a review: the overall score as a monumental numeral
// on a paper block, signed by the reviewer, beside the game and the facet
// scores. It sits at the end of the page, after the reader has read the case
// for it.
export function ReviewVerdict({
  review,
  game,
  authorName,
}: {
  review: Review;
  game: Game;
  authorName: string;
}) {
  const facets = scoredFacets(review.facets);
  const best = facets.length ? Math.max(...facets.map((f) => f.score)) : null;
  const weighted = facets.some((f) => f.weight !== undefined);
  const chip = trackChips(game, { short: true })[0];
  const meta = [
    game.initial_release_date
      ? new Date(game.initial_release_date).getUTCFullYear()
      : null,
    ...(game.platforms ?? [])
      .slice(0, 4)
      .map((p) => p.platform_abbreviation ?? p.platform_code ?? p.platform_name),
  ].filter(Boolean);

  return (
    <section
      aria-labelledby="verdict"
      className="grid overflow-hidden rounded-sm border-2 border-paper md:grid-cols-[18.75rem_1fr]"
    >
      <div className="flex flex-wrap items-end gap-x-3.5 bg-paper p-4 text-ink md:flex-col md:flex-nowrap md:items-stretch md:p-5.5">
        <h2 id="verdict" className="sr-only">
          Verdict
        </h2>
        <p
          className="font-headline text-[6.5rem] leading-[0.8] tracking-[-0.02em] md:text-[10.5rem]"
        >
          {review.rating}
        </p>
        <p className="font-label mb-1.5 text-sm font-extrabold tracking-[0.08em] md:mt-2 md:mb-0">
          Out of {MAX_RATING}
        </p>
        <div className="mt-1 flex w-full items-center gap-2.5 border-t border-ink/20 pt-3 md:mt-auto md:pt-4.5">
          <ReviewerAvatar
            userId={review.user_id}
            name={authorName}
            className="ring-2 ring-ink"
          />
          <div className="min-w-0 leading-tight">
            <Link
              href={`/members/${review.user_id}`}
              className="block truncate font-bold hover:underline"
            >
              {authorName}
            </Link>
            <small className="text-[0.82rem] text-ink/70">
              Reviewed {formatReviewDate(review.created_at)}
            </small>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4.5 bg-ink-2 p-4 md:px-6.5 md:py-5.5">
        <div className="flex items-center gap-3">
          <GameCover
            title={game.title}
            coverUrl={game.cover_url}
            className="w-11 rounded-[2px]"
            fallbackClassName="p-0.5 text-[0.55rem]"
          />
          <div className="min-w-0">
            <Link
              href={`/games/${game.game_id}`}
              className="font-label block truncate text-base font-extrabold tracking-[0.05em] transition-colors hover:text-highlight"
            >
              {game.title}
            </Link>
            {meta.length > 0 && (
              <small className="block text-[0.8rem] text-paper-mute">
                {meta.join(" · ")}
              </small>
            )}
          </div>
          {chip && (
            <Chip tone={chip.tone} className="ml-auto hidden sm:inline-flex">
              {chip.label}
            </Chip>
          )}
        </div>

        <p className="font-headline text-[2.4rem] leading-[0.9] md:text-[3.25rem]">
          The verdict
        </p>

        {facets.length > 0 ? (
          <dl className="grid grid-cols-2 gap-x-4 sm:grid-cols-3 xl:grid-cols-5">
            {facets.map((facet) => (
              <div
                key={facet.key}
                style={{ "--fill": facetFill(facet.score) } as React.CSSProperties}
                className={cn(
                  "relative flex flex-col border-t border-rule pt-3 pb-4",
                  "before:absolute before:inset-x-0 before:bottom-1 before:h-1 before:rounded-[2px] before:bg-ink-3",
                  "after:absolute after:bottom-1 after:left-0 after:h-1 after:w-(--fill) after:rounded-[2px]",
                  facet.score === best ? "after:bg-paper" : "after:bg-paper-mute/60",
                )}
              >
                <dt className="font-label order-2 mt-1 text-[0.78rem] font-extrabold tracking-[0.08em] text-paper-mute">
                  {facet.label}
                  {weighted && facet.weight !== undefined && (
                    <span className="ml-1.5 font-bold text-paper-mute/80">
                      {facet.weight}%
                    </span>
                  )}
                </dt>
                <dd
                  className={cn(
                    "font-headline order-1 text-[2.4rem] leading-[0.9] md:text-[2.9rem]",
                    facet.score === best ? "text-paper" : "text-paper-dim",
                  )}
                >
                  {facet.score}
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="border-t border-rule pt-3 text-sm text-paper-mute">
            A single overall score, without a category scorecard.
          </p>
        )}
      </div>
    </section>
  );
}
