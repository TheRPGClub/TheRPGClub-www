import Link from "next/link";

import { CornerRibbon } from "@/components/corner-ribbon";
import { MAX_RATING } from "@/lib/api/rating";
import type { Game } from "@/lib/api/types";
import { reviewAccents, type ReviewAccent } from "@/lib/reviews/accent";
import { cn } from "@/lib/utils";

const API_BASE = process.env.API_URL ?? "http://localhost:3000";

export interface ReviewBannerProps {
  game: Pick<
    Game,
    | "game_id"
    | "title"
    | "cover_url"
    | "art_url"
    | "gotm_month_year"
    | "nr_gotm_month_year"
  >;
  accent: ReviewAccent;
  // Absent while composing — there is no score or byline yet.
  rating?: number | null;
  authorId?: string | null;
  authorName?: string | null;
  createdAt?: string | null;
}

/**
 * The banner over a review: the game's art and title, in the treatment the
 * dashboard, game page and voting board give a game.
 *
 * The art is faded from both edges rather than only the left, because the
 * score sits at the right — over what would otherwise be the brightest part of
 * the artwork. The middle band stays uncovered so the art still reads.
 */
export function ReviewBanner({
  game,
  accent,
  rating,
  authorId,
  authorName,
  createdAt,
}: ReviewBannerProps) {
  const style = reviewAccents[accent];
  const imageUrl = game.art_url ?? game.cover_url;
  const scored = typeof rating === "number";

  // The club names a winner by the month it won, so the badge carries it.
  const monthYear =
    accent === "brand"
      ? game.gotm_month_year
      : accent === "purple"
        ? game.nr_gotm_month_year
        : null;
  const badge = style.label
    ? monthYear
      ? `${style.label} of ${monthYear}`
      : style.label
    : null;

  return (
    <div className="relative flex min-h-56 overflow-hidden rounded-xl border bg-card">
      {imageUrl && (
        <div className="absolute top-0 right-0 h-full w-[70%] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover object-[center_20%]"
          />
          <div className="absolute inset-0 bg-linear-to-r from-card to-transparent" />
        </div>
      )}

      {/* Right-edge scrim, so the score has ground to sit on. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-[32%] bg-linear-to-l from-card via-card/80 to-transparent"
      />

      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-y-0 left-0 w-[55%] bg-linear-to-r",
          style.wash,
        )}
      />

      {accent !== "neutral" && (
        <CornerRibbon
          accent={accent}
          label={accent === "brand" ? "GOTM" : "NR GOTM"}
          srLabel={`${style.label} winner`}
          size="sm"
        />
      )}

      <div className="relative flex w-full flex-col justify-center gap-3 p-6">
        {badge && (
          <span
            className={cn(
              "inline-flex items-center self-start rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-[0.15em] whitespace-nowrap uppercase",
              style.pill,
            )}
          >
            {badge}
          </span>
        )}

        <div className="flex items-end justify-between gap-6">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight break-words">
              <Link href={`/games/${game.game_id}`} className="hover:underline">
                {game.title}
              </Link>
            </h1>

            {authorId && authorName && (
              <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                <span className="text-muted-foreground">A review by</span>
                <Link
                  href={`/members/${authorId}`}
                  className="flex items-center gap-2 hover:underline"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`${API_BASE}/api/v1/users/${authorId}/avatar`}
                    alt=""
                    aria-hidden
                    className="size-6 shrink-0 rounded-full"
                  />
                  <span className="truncate font-medium">{authorName}</span>
                </Link>
                {createdAt && (
                  <>
                    <span aria-hidden className="text-muted-foreground">
                      ·
                    </span>
                    <time dateTime={createdAt} className="text-muted-foreground">
                      {new Date(createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </time>
                  </>
                )}
              </p>
            )}
          </div>

          {scored && (
            <div className="flex shrink-0 items-end gap-2">
              <span
                className={cn(
                  "text-5xl leading-[0.85] font-extralight tracking-tight tabular-nums",
                  style.readout,
                )}
              >
                {rating}
              </span>
              <div className="pb-0.5 text-[10px] leading-tight font-medium tracking-[0.2em] text-muted-foreground uppercase">
                <p>Score</p>
                <p className="whitespace-nowrap">of {MAX_RATING}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
