"use client";

import type { ReviewFormState } from "@/hooks/use-review-form";
import type { Review, ReviewRevision } from "@/lib/api/types";
import type { ReviewAccent } from "@/lib/reviews/accent";
import { reviewDeleteNote, reviewTakes } from "@/lib/reviews/takes";
import type { EarlierTake } from "./earlier-take-note";
import { EditStrip } from "./edit-strip";
import { FormDraftStrip } from "./form-draft-strip";

// A Revision being written: the Revision, the earlier take a Draft Revision
// answers, and what deleting a Published one does to the score.
export interface RevisionTake {
  revision: ReviewRevision;
  earlier: EarlierTake | null;
  deleteNote: string;
}

// The desk's foot strip for the take on it: a Draft's (or Draft Revision's)
// autosave and Publish, or a Published take's Edit.
export function FormStrip({
  form,
  accent,
  existing,
  revisionTake,
  onCancel,
  onPublished,
}: {
  form: ReviewFormState;
  accent: ReviewAccent;
  existing?: Review | null;
  revisionTake?: RevisionTake | null;
  onCancel?: () => void;
  onPublished?: (review: Review) => void;
}) {
  if (form.draft) return <FormDraftStrip form={form} accent={accent} onPublished={onPublished} />;
  if (!existing) return null;
  return (
    <EditStrip
      accent={accent}
      publishedAt={(revisionTake?.revision ?? existing).published_at}
      pending={form.pending}
      revision={revisionTake}
      deleteNote={reviewDeleteNote(reviewTakes(existing))}
      rated={form.rating !== null}
      onCancel={onCancel}
      // Already confirmed on the strip; deleting is the same call a Draft's
      // Discard makes.
      onDelete={form.discard}
    />
  );
}
