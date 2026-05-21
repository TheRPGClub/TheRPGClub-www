"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import {
  createReviewAction,
  deleteReviewAction,
  updateReviewAction,
  type ActionResult,
} from "@/app/actions/reviews";
import type { Review } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// UI works in 1..5 stars; backend stores 0..100. Keep the conversion in
// `app/actions/reviews.ts` so the form state stays in star-space.
const STAR_TO_RATING = 20;

export interface ReviewFormProps {
  userId: string;
  gameId: number;
  existing?: Review | null;
  onCancel?: () => void;
  // Fires after a successful save with the updated review.
  onSaved?: (review: Review) => void;
  // Allow callers to render a delete button inline (only useful when editing).
  showDelete?: boolean;
}

function ratingToStars(rating: number | null | undefined): number | null {
  if (rating == null) return null;
  const stars = Math.round(rating / STAR_TO_RATING);
  return Math.max(1, Math.min(5, stars));
}

export function ReviewForm({
  userId,
  gameId,
  existing,
  onCancel,
  onSaved,
  showDelete,
}: ReviewFormProps) {
  const router = useRouter();
  const [stars, setStars] = useState<number | null>(
    ratingToStars(existing?.rating),
  );
  const [body, setBody] = useState(existing?.body ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (stars === null) {
      setError("Pick a rating before posting.");
      return;
    }
    const payload = { stars, body };
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
    <form onSubmit={handleSubmit} className="space-y-3">
      <RatingInput value={stars} onChange={setStars} disabled={pending} />

      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={6}
        maxLength={8000}
        placeholder="What did you think? (optional)"
        disabled={pending}
        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
      />

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex items-center justify-between gap-2">
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
          <Button
            type="submit"
            size="sm"
            disabled={pending || stars === null}
          >
            {existing ? "Save changes" : "Post review"}
          </Button>
        </div>
      </div>
    </form>
  );
}

function RatingInput({
  value,
  onChange,
  disabled,
}: {
  value: number | null;
  onChange: (next: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-2" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          disabled={disabled}
          onClick={() => onChange(n)}
          className="rounded p-1 hover:bg-muted disabled:opacity-50"
        >
          <Star
            className={cn(
              "size-5",
              value !== null && n <= value
                ? "fill-amber-400 text-amber-400"
                : "text-muted-foreground/40",
            )}
            strokeWidth={1.5}
          />
          <span className="sr-only">{n} stars</span>
        </button>
      ))}
    </div>
  );
}
