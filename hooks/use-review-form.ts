"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Value } from "platejs";

import {
  createReviewAction,
  deleteReviewAction,
  publishReviewAction,
  updateReviewAction,
  type ActionResult,
} from "@/app/actions/reviews";
import { useDraftAutosave } from "@/hooks/use-draft-autosave";
import { isDraft } from "@/lib/reviews/draft";
import { isScoreLocked, scoreLocksAt } from "@/lib/reviews/edit-rules";
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
 * saving or deleting it. A Draft saves itself as it is written and leaves by
 * Publish or Discard; a Published Review saves when asked; a new one from the
 * game page is the quick take, published as it is posted, or becomes a Draft
 * when it moves to the full editor.
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
  const draft = existing ? isDraft(existing) : false;
  // A Published take's score is fixed 7 days after publishing (ADR 0013).
  // Read once when the editor opens; a server `score_locked` refusal (the
  // week ran out while the editor was open) locks it the same way.
  const [scoreLocked, setScoreLocked] = useState(() =>
    existing ? isScoreLocked(existing, Date.now()) : false,
  );
  // The day it locked, for the reason. A refusal while this page thought the
  // week still open (a clock running behind) says it locked now, never on a
  // day still to come.
  const [locksAt, setLocksAt] = useState(() => (existing ? scoreLocksAt(existing) : null));
  const lock = existing && !draft ? { locked: scoreLocked, locksAt } : null;
  const autosave = useDraftAutosave(draft && existing ? existing.review_id : null, {
    title,
    rating,
    body,
    facets,
  });

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
        : await createReviewAction(userId, gameId, payload, { publish: true });

      if (!result.ok) {
        if (result.code === "score_locked" && existing) {
          // Back to the published score, so the next Save keeps the rest.
          setScoreLocked(true);
          setLocksAt((at) => (at !== null && at <= Date.now() ? at : Date.now()));
          setRating(existing.rating);
        }
        setError(result.error ?? "Failed to save review.");
        return;
      }
      if (result.data) then(result.data);
    });
  };

  // The move from the game page's small editor to the full one, for a review
  // not yet written: it becomes a Draft there, so it needs no score yet.
  const startDraft = (then: (review: Review) => void) => {
    setError(null);
    const budgetError = weightsError(facets);
    if (budgetError) {
      setError(budgetError);
      return;
    }
    startTransition(async () => {
      const result = await createReviewAction(
        userId,
        gameId,
        { title, rating, body, facets },
        { publish: false },
      );
      if (!result.ok) {
        setError(result.error ?? "Couldn't start the draft.");
        return;
      }
      if (result.data) then(result.data);
    });
  };

  // A Draft's Publish: whatever autosave still holds goes first, so what is
  // published is what is on the sheet.
  const publish = (then: (review: Review) => void) => {
    if (!existing) return;
    setError(null);
    if (rating === null) {
      setError("Give it an overall score before publishing.");
      return;
    }
    startTransition(async () => {
      if (!(await autosave.flush())) {
        setError("Couldn't save the latest changes, so nothing was published. Try again.");
        return;
      }
      const result = await publishReviewAction(userId, existing.review_id, gameId);
      if (!result.ok) {
        setError(result.error ?? "Failed to publish.");
        return;
      }
      if (result.data) then(result.data);
    });
  };

  // A Draft's Discard, or a Published Review's Delete on the desk: already
  // confirmed on the strip.
  const discard = () => {
    if (!existing) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteReviewAction(userId, existing.review_id, gameId);
      if (!result.ok) {
        setError(result.error ?? "Failed to discard.");
        return;
      }
      autosave.stop();
      onDeleted?.();
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
    draft,
    // The score lock on a Published take; null on a Draft or a new review.
    lock,
    autosave,
    startDraft,
    publish,
    discard,
    refresh: () => router.refresh(),
  };
}

export type ReviewFormState = ReturnType<typeof useReviewForm>;
