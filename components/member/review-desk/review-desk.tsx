"use client";

import { RatingInput } from "@/components/member/rating-input";
import { cn } from "@/lib/utils";
import type { ReviewFormState } from "@/hooks/use-review-form";
import type { ReviewAccent } from "@/lib/reviews/accent";
import type { ReviewDeskGame } from "./desk-game";
import { DeskNote } from "./desk-note";
import { ScoreLock } from "./score-lock";
import { ReviewSheet } from "./review-sheet";

// The track a score is given under, in the Overall note's corner.
const TRACK_NOTE: Record<ReviewAccent, string | null> = {
  brand: "GOTM",
  purple: "NR-GOTM",
  neutral: null,
};

// The Overall note, which the Draft strip's missing score points at.
export const OVERALL_ID = "review-overall";

// The full review editor: the sheet the review is written on, and in the
// margin beside it the notes taped to the board, Overall and the Scorecard.
// The margin keeps its place while a long review scrolls past; beside a short
// one the sheet stretches to meet it. On smaller screens the notes drop under
// the sheet.
export function ReviewDesk({
  form,
  game,
  accent,
  scorecard,
  footer,
  strip,
}: {
  form: ReviewFormState;
  game?: ReviewDeskGame;
  accent: ReviewAccent;
  scorecard: React.ReactNode;
  footer: React.ReactNode;
  // The Draft's foot strip. A direct child of the board, so it can stay at
  // the bottom of the screen for the whole height of the desk (a sticky
  // element is held inside its parent).
  strip?: React.ReactNode;
}) {
  // The sheet and the notes share a grid of their own, apart from the
  // footer: a sticky element is held inside its containing block, so with the
  // footer in the same grid the notes would slide down over Save. A note
  // column taller than the screen scrolls inside itself rather than hiding
  // its foot.
  return (
    <div
      className={cn(
        "space-y-10 rounded-md border border-border bg-[radial-gradient(color-mix(in_oklab,var(--color-foreground)_5%,transparent)_1px,transparent_1px)] bg-size-[18px_18px] p-4 pt-7 sm:p-8",
        // Room above the sheet for the Draft's pencilled line.
        form.draft && "pt-13 sm:pt-14",
      )}
    >
      <div className="grid grid-cols-[minmax(0,1fr)] gap-x-8 gap-y-10 lg:grid-cols-[minmax(0,1fr)_21rem]">
        <ReviewSheet form={form} game={game} />
        <aside
          aria-label="Scores"
          className="flex flex-col gap-7 lg:sticky lg:top-[76px] lg:max-h-[calc(100dvh-92px)] lg:self-start lg:overflow-y-auto lg:px-2 lg:pt-3 lg:pb-4 lg:-mx-2 lg:-mt-3"
        >
          <DeskNote id={OVERALL_ID} heading="Overall" aside={TRACK_NOTE[accent]} className="scroll-mt-24 lg:-rotate-[1deg]">
            <RatingInput
              value={form.rating}
              onChange={form.setRating}
              accent={accent}
              disabled={form.pending}
              locked={form.lock?.locked}
            />
            {form.lock?.locked && <ScoreLock locksAt={form.lock.locksAt} />}
            {form.draft && form.rating === null && (
              <p className="mt-3 mb-0 text-[0.9rem] leading-tight font-semibold text-highlight italic">
                score it to publish
              </p>
            )}
          </DeskNote>
          <DeskNote className="lg:rotate-[0.5deg]">{scorecard}</DeskNote>
        </aside>
      </div>
      <div className="space-y-3 empty:hidden">{footer}</div>
      {strip}
    </div>
  );
}
