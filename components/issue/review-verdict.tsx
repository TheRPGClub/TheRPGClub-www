import Link from "next/link";
import type { Game, Review } from "@/lib/api/types";
import { Badge } from "@/components/ui/badge";
import { GameCover } from "@/components/issue/game-cover";
import { trackChips } from "@/components/issue/game-track";
import { scoredFacets } from "@/components/issue/review-meta";
import { ReviewVerdictFacets } from "@/components/issue/review-verdict-facets";
import { ReviewVerdictScore } from "@/components/issue/review-verdict-score";

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
      className="grid overflow-hidden rounded-sm border-2 border-foreground md:grid-cols-[18.75rem_1fr]"
    >
      <ReviewVerdictScore review={review} authorName={authorName} />

      <div className="flex flex-col gap-4.5 bg-card p-4 md:px-6.5 md:py-5.5">
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
              <small className="block text-[0.8rem] text-faint-foreground">
                {meta.join(" · ")}
              </small>
            )}
          </div>
          {chip && (
            <Badge tone={chip.tone} className="ml-auto hidden sm:inline-flex border-0">
              {chip.label}
            </Badge>
          )}
        </div>

        <p className="font-headline text-[2.4rem] leading-[0.9] md:text-[3.25rem]">
          The verdict
        </p>

        {facets.length > 0 ? (
          <ReviewVerdictFacets facets={facets} />
        ) : (
          <p className="border-t border-border pt-3 text-sm text-faint-foreground">
            A single overall score, without a category scorecard.
          </p>
        )}
      </div>
    </section>
  );
}
