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
import { Button } from "@/components/ui/button";
import { reviewAccents, type ReviewAccent } from "@/lib/reviews/accent";
import { cn } from "@/lib/utils";
import { RatingInput } from "./rating-input";
import { ReviewEditor } from "./review-editor";
import type { Value } from "platejs";

export interface ReviewFormProps {
  userId: string;
  gameId: number;
  existing?: Review | null;
  onCancel?: () => void;
  // Fires after a successful save with the updated review.
  onSaved?: (review: Review) => void;
  // Allow callers to render a delete button inline (only useful when editing).
  showDelete?: boolean;
  // Which hue the window wears — the game's category. Defaults to neutral so
  // a caller without the game to hand still renders sensibly.
  accent?: ReviewAccent;
}

export function ReviewForm({
  userId,
  gameId,
  existing,
  onCancel,
  onSaved,
  showDelete,
  accent = "neutral",
}: ReviewFormProps) {
  const router = useRouter();
  const style = reviewAccents[accent];
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
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (rating === null) {
      setError("Pick a rating before posting.");
      return;
    }
    const payload = { rating, body };
    startTransition(async () => {
      const result: ActionResult<Review> = existing
        ? await updateReviewAction(userId, existing.review_id, gameId, payload)
        : await createReviewAction(userId, gameId, payload);

      if (!result.ok) {
        setError(result.error ?? "Failed to save review.");
        return;
      }
      if (result.data) onSaved?.(result.data);
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
      router.refresh();
      onCancel?.();
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "relative overflow-hidden rounded-xl border",
        style.surface,
      )}
    >
      {/* Identifies the category at a glance, as a rule rather than a wash —
          the hue marks the surface without colouring what's written on it. */}
      <span
        aria-hidden
        className={cn("absolute inset-x-0 top-0 h-px bg-linear-to-r", style.rule)}
      />

      <div className="space-y-4 p-4">
        <RatingInput
          value={rating}
          onChange={setRating}
          accent={accent}
          disabled={pending}
        />

        <ReviewEditor
          initialValue={initialValue}
          onChange={setBody}
          disabled={pending}
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
          <div className="flex gap-2">
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
