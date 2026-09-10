"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createReviewAction,
  deleteReviewAction,
  updateReviewAction,
  type ActionResult,
} from "@/app/actions/reviews";
import type { Review } from "@/lib/api/types";
import { emptyReviewValue, reviewBodyValue } from "@/lib/api/review-body";
import { Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ReviewAccent } from "@/lib/reviews/accent";
import {
  ensureWeights,
  sanitizeReviewFacets,
  weightsError,
  type ReviewFacets,
} from "@/lib/reviews/facets";
import { RatingInput } from "./rating-input";
import { ReviewScorecardEditor } from "./review-scorecard-editor";
import { ReviewEditor } from "./review-editor";
import type { Value } from "platejs";

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
  const router = useRouter();
  // Null until chosen, so a new review can't be posted with an unintended
  // score. 0 is a real rating, so it can't double as "unset".
  const [rating, setRating] = useState<number | null>(
    existing?.rating ?? null,
  );
  // `initialValue` seeds the editor once; `body` tracks what it reports back.
  // A legacy plain-text or imported review is normalized into blocks here, so
  // editing one silently upgrades it to rich text on the next save.
  const [initialValue] = useState<Value>(() =>
    existing ? reviewBodyValue(existing.body) : emptyReviewValue(),
  );
  const [body, setBody] = useState<Value>(initialValue);
  // null is the quick take — no scorecard — which is what every review
  // written before the scorecard existed already stores, and still a choice
  // rather than an omission.
  // `ensureWeights` because the composer shows a split on every card: a review
  // written before weights existed gets the even one it was already being
  // averaged by, rather than a column of blanks.
  const [facets, setFacets] = useState<ReviewFacets | null>(() =>
    ensureWeights(sanitizeReviewFacets(existing?.facets)),
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // `then` runs only on a successful save, which is how the transfer button
  // avoids navigating away from an edit the server rejected.
  const save = (then: (review: Review) => void) => {
    setError(null);
    if (rating === null) {
      setError("Pick a rating before posting.");
      return;
    }
    // Caught here rather than in the action because the action's sanitizer
    // drops weights it cannot trust, and silently discarding a weighting
    // someone spent time on is the one outcome worse than refusing to save.
    const budgetError = weightsError(facets);
    if (budgetError) {
      setError(budgetError);
      return;
    }
    const payload = { rating, body, facets };
    startTransition(async () => {
      const result: ActionResult<Review> = existing
        ? await updateReviewAction(userId, existing.review_id, gameId, payload)
        : await createReviewAction(userId, gameId, payload);

      if (!result.ok) {
        setError(result.error ?? "Failed to save review.");
        return;
      }
      if (result.data) then(result.data);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    save((review) => {
      onSaved?.(review);
      router.refresh();
    });
  };

  const handleDelete = () => {
    if (!existing) return;
    if (!confirm("Delete this review?")) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteReviewAction(userId, existing.review_id, gameId);
      if (!result.ok) {
        setError(result.error ?? "Failed to delete.");
        return;
      }
      if (onDeleted) {
        onDeleted();
      } else {
        router.refresh();
        onCancel?.();
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative overflow-hidden rounded-xl border bg-card"
    >
      <div className="space-y-4 p-4">
        <RatingInput
          value={rating}
          onChange={setRating}
          accent={accent}
          disabled={pending}
        />

        {scorecard ? (
          <ReviewScorecardEditor
            value={facets}
            onChange={setFacets}
            overall={rating}
            // The average is offered, never imposed — see the footer's comment.
            onUseAverage={setRating}
            accent={accent}
            disabled={pending}
          />
        ) : (
          facets && (
            // Says the scorecard is still there and where to change it. Without
            // this the categories simply vanish from the form, which reads like
            // the save is about to drop them.
            <p className="text-xs text-muted-foreground">
              Scored on {facets.order.length}{" "}
              {facets.order.length === 1 ? "category" : "categories"}, kept as
              they are. Open the full review editor to change them.
            </p>
          )
        )}

        <ReviewEditor
          initialValue={initialValue}
          onChange={setBody}
          disabled={pending}
          toolbar={toolbar}
        />

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="flex items-center justify-between gap-2 border-t border-border/60 pt-3">
          {showDelete && existing ? (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={pending}
            >
              Delete
            </Button>
          ) : (
            <span />
          )}
          <div className="flex flex-wrap items-center justify-end gap-2">
            {onTransfer && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => save(onTransfer)}
                disabled={pending || rating === null}
              >
                <Maximize2 />
                Open full review editor
              </Button>
            )}
            {onCancel && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onCancel}
                disabled={pending}
              >
                Cancel
              </Button>
            )}
            <Button type="submit" size="sm" disabled={pending || rating === null}>
              {existing ? "Save changes" : "Post review"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
