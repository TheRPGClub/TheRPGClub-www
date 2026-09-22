import { Pencil } from "lucide-react";
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
  // Only the author gets the edit affordance, and it lives here rather than
  // as a control floating below the banner — this card is the review, so
  // editing it starts where it's introduced. The link just adds `?edit` to
  // the current URL; ReviewDetail is what actually opens the editor.
  canEdit?: boolean;
  // The reviewer's own headline, optional. Present, it takes over the
  // banner's main line and the game's name steps down to a small line
  // above it — a cover leads with the story's own title, not the section
  // it ran in. Absent, the banner reads exactly as it always has.
  title?: string | null;
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
  canEdit,
  title,
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

  const pill = badge && (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-[0.15em] whitespace-nowrap uppercase",
        style.pill,
      )}
    >
      {badge}
    </span>
  );

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
        {!title && pill && <div className="self-start">{pill}</div>}

        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <div className="min-w-0">
            {title ? (
              <>
                <p className="text-sm">
                  <Link
                    href={`/games/${game.game_id}`}
                    className="font-medium text-muted-foreground hover:text-foreground hover:underline"
                  >
                    {game.title}
                  </Link>
                </p>
                <h1 className="mt-1.5 text-3xl font-bold tracking-tight break-words">
                  {title}
                </h1>
              </>
            ) : (
              <h1 className="text-2xl font-bold tracking-tight break-words">
                <Link href={`/games/${game.game_id}`} className="hover:underline">
                  {game.title}
                </Link>
              </h1>
            )}

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
                {/* The pill rides at the end of the byline rather than up by
                    the game's name — title present, the game already had its
                    turn as the small line above the headline; the accolade
                    belongs with the rest of this row's metadata. */}
                {title && pill && (
                  <>
                    <span aria-hidden className="text-muted-foreground">
                      ·
                    </span>
                    {pill}
                  </>
                )}
              </p>
            )}
          </div>

          {(scored || canEdit) && (
            <div className="ml-auto flex shrink-0 flex-col items-end gap-2">
              {scored && (
                <div className="flex items-end gap-2">
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
              {canEdit && (
                <Link
                  href="?edit=1"
                  className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Pencil className="size-3" />
                  Edit your review
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
