"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Value } from "platejs";

import {
  createReviewAction,
  deleteReviewAction,
  updateReviewAction,
  type ActionResult,
} from "@/app/actions/reviews";
import type { Review } from "@/lib/api/types";
import { reviewBodyValue } from "@/lib/api/review-body";
import { emptyRichTextValue } from "@/lib/rich-text/text";
import {
  ensureWeights,
  sanitizeReviewFacets,
  weightsError,
  type ReviewFacets,
} from "@/lib/reviews/facets";

/**
 * A review as it is written: its title, rating, body and scorecard, and
 * saving or deleting it.
 */
export function useReviewForm({
  userId,
  gameId,
  existing,
  onCancel,
  onDeleted,
}: {
  userId: string;
  gameId: number;
  existing?: Review | null;
  onCancel?: () => void;
  onDeleted?: () => void;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(existing?.title ?? "");
  // Null until chosen, so a new review can't be posted with an unintended
  // score. 0 is a real rating, so it can't double as "unset".
  const [rating, setRating] = useState<number | null>(existing?.rating ?? null);
  // `initialValue` seeds the editor once; `body` tracks what it reports back.
  // A legacy plain-text or imported review is normalized into blocks here, so
  // editing one silently upgrades it to rich text on the next save.
  const [initialValue] = useState<Value>(() =>
    existing ? reviewBodyValue(existing.body) : emptyRichTextValue(),
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
    const payload = { title, rating, body, facets };
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

  const remove = () => {
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

  return {
    title,
    setTitle,
    rating,
    setRating,
    initialValue,
    body,
    setBody,
    facets,
    setFacets,
    error,
    pending,
    save,
    remove,
    refresh: () => router.refresh(),
  };
}

export type ReviewFormState = ReturnType<typeof useReviewForm>;
