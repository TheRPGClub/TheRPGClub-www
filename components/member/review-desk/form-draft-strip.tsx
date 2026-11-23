"use client";

import type { ReviewFormState } from "@/hooks/use-review-form";
import type { Review } from "@/lib/api/types";
import type { ReviewAccent } from "@/lib/reviews/accent";
import { discardLoss, draftChecklist } from "@/lib/reviews/draft";
import { richTextPlainText } from "@/lib/rich-text/text";
import { DraftStrip } from "./draft-strip";
import { OVERALL_ID } from "./review-desk";

// The Draft strip, filled from the review form as it stands.
export function FormDraftStrip({
  form,
  accent,
  onPublished,
}: {
  form: ReviewFormState;
  accent: ReviewAccent;
  onPublished?: (review: Review) => void;
}) {
  const storyLength = richTextPlainText(form.body).length;
  return (
    <DraftStrip
      status={form.autosave.status}
      error={form.autosave.error}
      onRetry={form.autosave.retryNow}
      checks={draftChecklist({ title: form.title, storyLength, rating: form.rating })}
      onScore={focusOverall}
      accent={accent}
      pending={form.pending}
      discardLoss={discardLoss({
        rating: form.rating,
        hasScorecard: Boolean(form.facets?.order.length),
        storyLength,
      })}
      onDiscard={form.discard}
      onPublish={() => form.publish((review) => onPublished?.(review))}
      revision={form.revision}
    />
  );
}

// The strip's missing score goes to the Overall note and puts the cursor in
// its score.
function focusOverall() {
  const note = document.getElementById(OVERALL_ID);
  const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  note?.scrollIntoView({ behavior: still ? "auto" : "smooth", block: "center" });
  note?.querySelector<HTMLInputElement>("input")?.focus({ preventScroll: true });
}
