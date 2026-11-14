"use client";

import type { Review } from "@/lib/api/types";
import { MAX_REVIEW_TITLE_LENGTH } from "@/lib/api/review-title";
import { Input } from "@/components/ui/input";
import type { ReviewAccent } from "@/lib/reviews/accent";
import { useReviewForm } from "@/hooks/use-review-form";
import { RatingInput } from "./rating-input";
import { ReviewScorecardEditor } from "./review-scorecard-editor";
import { ReviewEditor } from "./review-editor";
import { ReviewFormActions } from "./review-composer/review-form-actions";

export interface ReviewFormProps {
  userId: string;
  gameId: number;
  existing?: Review | null;
  onCancel?: () => void;
  // Fires after a successful save with the updated review.
  onSaved?: (review: Review) => void;
  // Fires after a successful delete. A caller whose whole page *is* this
  // review needs to navigate away rather than refresh into a 404, which is
  // why this is separate from `onCancel`.
  onDeleted?: () => void;
  // When given, the form offers to move to the full-page editor. Providing it
  // is what makes the button exist at all — the small editor on a game page
  // has somewhere bigger to go, the full page does not.
  //
  // The handover saves first: leaving with unsaved edits would silently drop
  // them, and the new review has no page to move to until it has an id.
  onTransfer?: (review: Review) => void;
  // Allow callers to render a delete button inline (only useful when editing).
  showDelete?: boolean;
  // Which hue the rating control wears — the game's category. Defaults to
  // neutral so a caller without the game to hand still renders sensibly.
  accent?: ReviewAccent;
  // Narrows the toolbar to lettering styles. The small editor on a game page
  // uses it; the full-page editor takes the lot.
  toolbar?: "compact" | "full";
  // Whether the scorecard can be built here. The game page's composer is the
  // quick one — a score and a few words — so it leaves the templates to the
  // full editor rather than putting a grading rubric in a box the size of a
  // comment field.
  //
  // Off does not mean discarded: a review that already has a scorecard keeps
  // it through a save made here. Hiding a control is not permission to throw
  // away what it holds.
  scorecard?: boolean;
}

export function ReviewForm({
  userId,
  gameId,
  existing,
  onCancel,
  onSaved,
  onDeleted,
  onTransfer,
  showDelete,
  accent = "neutral",
  toolbar = "full",
  scorecard = true,
}: ReviewFormProps) {
  const form = useReviewForm({ userId, gameId, existing, onCancel, onDeleted });
  const { facets, pending } = form;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    form.save((review) => {
      onSaved?.(review);
      form.refresh();
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative overflow-hidden rounded-md border border-border bg-card"
    >
      <div className="space-y-4 p-4">
        <Input
          value={form.title}
          onChange={(e) => form.setTitle(e.target.value)}
          placeholder="Give your review a title (optional)"
          maxLength={MAX_REVIEW_TITLE_LENGTH}
          disabled={pending}
          aria-label="Review title"
        />

        <RatingInput
          value={form.rating}
          onChange={form.setRating}
          accent={accent}
          disabled={pending}
        />

        {scorecard ? (
          <ReviewScorecardEditor
            value={facets}
            onChange={form.setFacets}
            overall={form.rating}
            // The average is offered, never imposed — see the footer's comment.
            onUseAverage={form.setRating}
            accent={accent}
            disabled={pending}
          />
        ) : (
          facets && (
            // Says the scorecard is still there and where to change it. Without
            // this the categories simply vanish from the form, which reads like
            // the save is about to drop them.
            <p className="text-xs text-faint-foreground">
              Scored on {facets.order.length}{" "}
              {facets.order.length === 1 ? "category" : "categories"}, kept as
              they are. Open the full review editor to change them.
            </p>
          )
        )}

        <ReviewEditor
          initialValue={form.initialValue}
          onChange={form.setBody}
          disabled={pending}
          toolbar={toolbar}
        />

        {form.error && (
          <p role="alert" className="text-sm text-destructive">
            {form.error}
          </p>
        )}

        <ReviewFormActions
          editing={Boolean(existing)}
          pending={pending}
          rated={form.rating !== null}
          onDelete={showDelete && existing ? form.remove : undefined}
          onTransfer={onTransfer && (() => form.save(onTransfer))}
          onCancel={onCancel}
        />
      </div>
    </form>
  );
}
