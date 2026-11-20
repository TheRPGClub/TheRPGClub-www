"use client";

import { RatingInput } from "@/components/member/rating-input";
import type { ReviewFormState } from "@/hooks/use-review-form";
import type { ReviewAccent } from "@/lib/reviews/accent";
import type { ReviewDeskGame } from "./desk-game";
import { DeskNote } from "./desk-note";
import { ReviewSheet } from "./review-sheet";

// The track a score is given under, in the Overall note's corner.
const TRACK_NOTE: Record<ReviewAccent, string | null> = {
  brand: "GOTM",
  purple: "NR-GOTM",
  neutral: null,
};

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
}: {
  form: ReviewFormState;
  game?: ReviewDeskGame;
  accent: ReviewAccent;
  scorecard: React.ReactNode;
  footer: React.ReactNode;
}) {
  // The sheet and the notes share a grid of their own, apart from the
  // footer: a sticky element is held inside its containing block, so with the
  // footer in the same grid the notes would slide down over Save. A note
  // column taller than the screen scrolls inside itself rather than hiding
  // its foot.
  return (
    <div className="space-y-10 rounded-md border border-border bg-[radial-gradient(color-mix(in_oklab,var(--color-foreground)_5%,transparent)_1px,transparent_1px)] bg-size-[18px_18px] p-4 pt-7 sm:p-8">
      <div className="grid grid-cols-[minmax(0,1fr)] gap-x-8 gap-y-10 lg:grid-cols-[minmax(0,1fr)_21rem]">
        <ReviewSheet form={form} game={game} />
        <aside
          aria-label="Scores"
          className="flex flex-col gap-7 lg:sticky lg:top-[76px] lg:max-h-[calc(100dvh-92px)] lg:self-start lg:overflow-y-auto lg:px-2 lg:pt-3 lg:pb-4 lg:-mx-2 lg:-mt-3"
        >
          <DeskNote heading="Overall" aside={TRACK_NOTE[accent]} className="lg:-rotate-[1deg]">
            <RatingInput
              value={form.rating}
              onChange={form.setRating}
              accent={accent}
              disabled={form.pending}
            />
          </DeskNote>
          <DeskNote className="lg:rotate-[0.5deg]">{scorecard}</DeskNote>
        </aside>
      </div>
      <div className="space-y-3">{footer}</div>
    </div>
  );
}
