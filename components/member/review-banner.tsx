import { Pencil } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Chip } from "@/components/issue/chip";
import { trackChips } from "@/components/issue/game-track";
import {
  ReviewerAvatar,
  ScoreBox,
  formatReviewDate,
} from "@/components/issue/review-meta";
import { MAX_RATING } from "@/lib/api/rating";
import type { Game } from "@/lib/api/types";
import type { ReviewAccent } from "@/lib/reviews/accent";
import { cn } from "@/lib/utils";

export interface ReviewBannerProps {
  game: Pick<
    Game,
    | "game_id"
    | "title"
    | "cover_url"
    | "art_url"
    | "gotm_month_year"
    | "nr_gotm_month_year"
  > &
    Partial<Pick<Game, "gotm_won" | "nr_gotm_won">>;
  // Kept for callers that pass it; the banner reads the win from the game.
  accent?: ReviewAccent;
  // Absent while composing — there is no score or byline yet.
  rating?: number | null;
  authorId?: string | null;
  authorName?: string | null;
  createdAt?: string | null;
  // Only the author gets the edit affordance, and it lives in the byline: this
  // banner is the review, so editing it starts where it's introduced. The
  // link just adds `?edit` to the current URL; ReviewDetail is what actually
  // opens the editor.
  canEdit?: boolean;
  // The reviewer's own headline, optional. Present, it is the banner's
  // monumental line and the game steps down to the line above it; absent,
  // the game's name takes the headline.
  title?: string | null;
  // Leads the chip line, e.g. the staff "Preview" badge.
  badge?: ReactNode;
}

/**
 * The cover over a review: full-bleed key art, the game and its win chip on a
 * small line, the review's headline set huge, the byline, and the score in a
 * paper block at the right. It bleeds to the content column's edges, so it
 * undoes the layout's padding itself.
 */
export function ReviewBanner({
  game,
  rating,
  authorId,
  authorName,
  createdAt,
  canEdit,
  title,
  badge,
}: ReviewBannerProps) {
  const art = game.art_url ?? game.cover_url;
  const scored = typeof rating === "number";
  // `gotm_won` isn't on every embedded game; a month-year means it won.
  const chips = trackChips({
    gotm_won: game.gotm_won ?? !!game.gotm_month_year,
    nr_gotm_won: game.nr_gotm_won ?? !!game.nr_gotm_month_year,
    gotm_month_year: game.gotm_month_year,
    nr_gotm_month_year: game.nr_gotm_month_year,
  }, { short: true });
  const headline = title || game.title;

  return (
    <section
      aria-label="Review"
      className="relative isolate bleed -mt-6 overflow-hidden bg-black md:min-h-[420px]"
    >
      {art && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={art}
          alt=""
          className="absolute inset-0 -z-20 size-full object-cover object-[62%_30%]"
        />
      )}
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 -z-10",
          art
            ? "bg-[linear-gradient(0deg,var(--color-background)_0%,color-mix(in_oklab,var(--color-background)_75%,transparent)_45%,color-mix(in_oklab,var(--color-background)_90%,transparent)_100%)] md:bg-[linear-gradient(90deg,color-mix(in_oklab,var(--color-background)_97%,transparent)_0%,color-mix(in_oklab,var(--color-background)_82%,transparent)_46%,color-mix(in_oklab,var(--color-background)_25%,transparent)_100%),linear-gradient(0deg,var(--color-background)_0%,transparent_50%)]"
            : "bg-[linear-gradient(0deg,var(--color-background)_0%,var(--color-card)_100%)]",
        )}
      />

      <div className="grid gap-5 px-4 pt-15 pb-6 sm:px-7 md:min-h-[420px] md:grid-cols-[1fr_auto] md:items-end md:gap-7 md:px-8 md:pt-16 md:pb-7.5">
        <div className="min-w-0">
          <h1 className="font-headline max-w-[15ch] text-[2.6rem] leading-[0.9] text-balance break-words md:text-[4.75rem]">
            {headline}
          </h1>
          {/* What the game is to the club follows the headline, never above it. */}
          {(badge || chips.length > 0 || title) && (
            <p className="mt-4 flex flex-wrap items-center gap-2">
              {badge}
              {chips.map((chip) => (
                <Chip key={chip.tone} tone={chip.tone}>
                  {chip.label}
                </Chip>
              ))}
              {title && (
                <Link
                  href={`/games/${game.game_id}`}
                  className="font-label text-base font-extrabold tracking-[0.06em] text-foreground transition-colors hover:text-highlight"
                >
                  {game.title}
                </Link>
              )}
            </p>
          )}

          {authorId && authorName && (
            <p className="mt-4.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm text-dim-foreground">
              <ReviewerAvatar userId={authorId} name={authorName} size="lg" />
              <span>
                <Link
                  href={`/members/${authorId}`}
                  className="font-semibold text-foreground transition-colors hover:text-highlight"
                >
                  {authorName}
                </Link>
                {createdAt && (
                  <>
                    {" · reviewed "}
                    <time dateTime={createdAt}>{formatReviewDate(createdAt)}</time>
                  </>
                )}
              </span>
              {canEdit && (
                <Link
                  href="?edit=1"
                  className="font-label ml-1.5 inline-flex items-center gap-1.5 text-[0.82rem] font-extrabold tracking-[0.08em] text-dim-foreground transition-colors hover:text-highlight"
                >
                  <Pencil aria-hidden className="size-3.5" />
                  Edit your review
                </Link>
              )}
            </p>
          )}
        </div>

        {scored && (
          <div className="flex items-center gap-3 md:block md:text-center">
            <ScoreBox
              rating={rating}
              className="size-[76px] text-[3.25rem] md:size-[150px] md:rounded-md md:text-[6.5rem]"
            />
            <span className="font-label block text-[0.82rem] font-extrabold tracking-[0.1em] text-dim-foreground md:mt-2">
              Out of {MAX_RATING}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
