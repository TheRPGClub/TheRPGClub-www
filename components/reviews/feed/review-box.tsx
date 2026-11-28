import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GameCover } from "@/components/issue/game-cover";
import { trackChips } from "@/components/issue/game-track";
import { reviewBodyText } from "@/lib/api/review-body";
import { reviewHref } from "@/lib/reviews/href";
import { reviewerName } from "@/lib/reviews/reviewer-name";
import {
  feedClock,
  feedState,
  feedTrack,
  previousScore,
  type ReviewFeedEntry,
} from "@/lib/reviews/feed";
import { cn } from "@/lib/utils";
import { ReviewBoxScore } from "./review-box-score";

// One Review on the feed as a ruled box that opens it: the 3:4 cover, the
// pill row (track, then state), the game headline, the byline and the
// excerpt, with the score in the corner. The box edge and the cover's foot
// bar take the game's track ink. On a narrow box (a phone) the headline sits
// beside a small cover and the rest runs full width under both.
export function ReviewBox({ entry }: { entry: ReviewFeedEntry }) {
  const track = feedTrack(entry);
  const state = feedState(entry);
  // "GOTM · Nov 2024": the track pill, with the month it won.
  const chip = entry.game ? trackChips(entry.game, { short: true, shortMonth: true })[0] : undefined;
  const previous = previousScore(entry);
  const title = entry.game?.title ?? "Untitled game";
  const name = reviewerName(entry.user, "A member");
  const ownTitle = entry.title?.trim();
  const text = entry.written ? reviewBodyText(entry.body)?.replace(/\s+/g, " ").trim() : null;
  return (
    <Link
      href={reviewHref(entry.review_id, { take: entry.revision_id ?? undefined })}
      data-slot="review-box"
      data-tone={track ?? undefined}
      className={cn(
        "group relative grid grid-cols-[4rem_minmax(0,1fr)] gap-x-3 gap-y-2.5 overflow-hidden rounded-[2.4px] border-2 bg-card p-2.5",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight @lg:flex @lg:min-h-[178px] @lg:gap-4 @lg:p-3",
        track === "gotm" ? "border-gotm" : track === "nr" ? "border-nr" : "border-foreground",
      )}
    >
      <div className="relative self-start">
        <GameCover title={title} coverUrl={entry.game?.cover_url} className="w-16 @lg:w-[115px]" fallbackClassName="p-1 text-[10px] @lg:p-2 @lg:text-[15px]" />
        {track && (
          <span aria-hidden className={cn("absolute inset-x-0 bottom-0 h-1", track === "gotm" ? "bg-gotm" : "bg-nr")} />
        )}
      </div>
      <div
        className={cn(
          "contents @lg:flex @lg:min-w-0 @lg:flex-1 @lg:flex-col @lg:items-start @lg:gap-[7px]",
          previous != null ? "@lg:pr-[200px]" : "@lg:pr-[130px]",
        )}
      >
        {(chip || state) && (
          <span className="order-2 col-span-2 inline-flex max-w-full flex-nowrap gap-1.5 @lg:order-none">
            {chip && <Badge tone={chip.tone} size="pill">{chip.label}</Badge>}
            {state === "revisited" && (
              <Badge tone="outline" size="pill">
                <RotateCcw aria-hidden />
                Revisited
              </Badge>
            )}
            {state === "quick" && <Badge tone="outline" size="pill">Quick take</Badge>}
          </span>
        )}
        <h3
          data-slot="review-box-title"
          className={cn(
            "font-headline order-1 col-start-2 row-start-1 self-start text-[21px] leading-[0.98] text-balance break-words uppercase transition-colors group-hover:text-highlight @lg:order-none @lg:pr-0 @lg:text-[31px]",
            previous != null ? "pr-[7.5rem]" : "pr-[4.75rem]",
          )}
        >
          {title}
        </h3>
        <p className="font-label order-3 col-span-2 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[0.78rem] tracking-[0.08em] text-dim-foreground @lg:order-none">
          <span className="whitespace-nowrap">
            {name} · <time dateTime={entry.published_at}>{feedClock(entry.published_at)}</time>
          </span>
          {previous != null && (
            <span className="whitespace-nowrap text-highlight">
              was {previous}, now {entry.rating}
            </span>
          )}
        </p>
        <p
          className={cn(
            "order-4 col-span-2 line-clamp-2 text-[0.95rem] leading-[1.45] @lg:order-none",
            text || ownTitle ? "text-dim-foreground" : "text-faint-foreground italic",
          )}
        >
          {ownTitle && <span className="font-semibold text-foreground">{ownTitle}{text ? ". " : ""}</span>}
          {text ?? (ownTitle ? null : "Score only")}
        </p>
      </div>
      <ReviewBoxScore rating={entry.rating} previous={previous} track={track} />
    </Link>
  );
}
