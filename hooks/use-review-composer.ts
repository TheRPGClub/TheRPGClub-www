"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Review } from "@/lib/api/types";
import { reviewHref } from "@/lib/reviews/href";

// The game reviews block's composer state: whether the quick composer is
// open, which of the viewer's reviews is in the small editor, and the hand-off
// to the full-page editor.
export function useReviewComposer({
  startComposing,
  composeCloseHref,
}: {
  // Opens the composer straight away (`?compose`).
  startComposing: boolean;
  // Where closing it goes, so the `?compose` that opened it drops out.
  composeCloseHref?: string;
}) {
  const router = useRouter();
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [composing, setComposing] = useState(startComposing);
  // `startComposing` follows the URL, which can change without a remount.
  const [prevStart, setPrevStart] = useState(startComposing);
  if (startComposing !== prevStart) {
    setPrevStart(startComposing);
    setComposing(startComposing);
  }

  // Handing over to the full page: the save has already happened, so this only
  // has to go somewhere.
  // `?edit` so the full page opens in the editor rather than dropping the
  // writer back into a read view they then have to click out of.
  const openFullEditor = (review: Review) =>
    router.push(reviewHref(review.review_id, { edit: true }));

  const closeComposer = () => {
    setComposing(false);
    if (startComposing && composeCloseHref) {
      router.replace(composeCloseHref, { scroll: false });
    }
  };

  return {
    composing,
    openComposer: () => setComposing(true),
    closeComposer,
    editingReviewId,
    setEditingReviewId,
    openFullEditor,
  };
}
