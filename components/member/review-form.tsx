"use client";

import type { Review } from "@/lib/api/types";
import type { RevisionTake } from "./review-desk/form-strip";

export type { RevisionTake };
import type { ReviewAccent } from "@/lib/reviews/accent";
import { useReviewForm } from "@/hooks/use-review-form";
import { ReviewScorecardEditor } from "./review-scorecard-editor";
import { ReviewFormActions } from "./review-composer/review-form-actions";
import type { ReviewDeskGame } from "./review-desk/desk-game";
import { QuickSheet } from "./review-desk/quick-sheet";
import { FormStrip } from "./review-desk/form-strip";
import { ReviewDesk } from "./review-desk/review-desk";

export interface ReviewFormProps {
  userId: string;
  gameId: number;
  existing?: Review | null;
  // Writes this Revision of `existing` instead of its first take: a Draft
  // Revision with the earlier take taped above Overall, or a Published one
  // whose Delete says where the score goes ("The score goes back to 85").
  revisionTake?: RevisionTake | null;
  onCancel?: () => void;
  // Fires after a successful save with the updated review.
  onSaved?: (review: Review) => void;
  // Fires after a successful delete, or a Draft's discard. A caller whose
  // whole page *is* this review needs to navigate away rather than refresh
  // into a 404, which is why this is separate from `onCancel`.
  onDeleted?: () => void;
  // Fires after a Draft is published, with the Published Review.
  onPublished?: (review: Review) => void;
  // When given, the form offers to move to the full-page editor. Providing it
  // is what makes the button exist at all — the small editor on a game page
  // has somewhere bigger to go, the full page does not.
  //
  // The handover saves first: leaving with unsaved edits would silently drop
  // them, and the new review has no page to move to until it has an id. A
  // new review moves as a Draft, so it needs no score yet.
  onTransfer?: (review: Review) => void;
  // Allow callers to render a delete button inline (only useful when editing).
  showDelete?: boolean;
  // Which hue the rating control wears — the game's category. Defaults to
  // neutral so a caller without the game to hand still renders sensibly.
  accent?: ReviewAccent;
  // "desk" is the full review editor: the sheet under the game's banner with
  // every formatting tool, and the Overall and Scorecard notes beside it.
  // "quick" is the game page's small composer: a score and a few words, with
  // the lettering tools only and no scorecard — it leaves the templates to the
  // full editor rather than putting a grading rubric in a box the size of a
  // comment field.
  //
  // Quick does not mean discarded: a review that already has a scorecard
  // keeps it through a save made there. Hiding a control is not permission
  // to throw away what it holds.
  layout?: "desk" | "quick";
  // The game, for the desk's banner: its art, its name and its pill.
  game?: ReviewDeskGame;
}

export function ReviewForm({
  userId,
  gameId,
  existing,
  revisionTake,
  onCancel,
  onSaved,
  onDeleted,
  onPublished,
  onTransfer,
  showDelete,
  accent = "neutral",
  layout = "desk",
  game,
}: ReviewFormProps) {
  const revision = revisionTake?.revision ?? null;
  const form = useReviewForm({ userId, gameId, existing, revision, onCancel, onDeleted });
  const { facets, pending } = form;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // A Draft saves itself; only Publish takes it further.
    if (form.draft) return;
    form.save((review) => {
      onSaved?.(review);
      form.refresh();
    });
  };

  const alert = form.error && (
    <p role="alert" className="text-sm text-destructive">
      {form.error}
    </p>
  );
  // On the desk a Draft and a Published take each have their strip, which
  // carries the actions; the footer keeps only the error. The quick sheet
  // keeps its row of actions.
  const strip =
    layout === "desk" && (form.draft || existing) ? (
      <FormStrip form={form} accent={accent} existing={existing} revisionTake={revisionTake}
        onCancel={onCancel} onPublished={onPublished} />
    ) : null;
  const footer = strip ? (
    alert
  ) : (
    <>
      {alert}
      <ReviewFormActions
        editing={Boolean(existing)}
        pending={pending}
        rated={form.rating !== null}
        onDelete={showDelete && existing ? form.remove : undefined}
        onTransfer={onTransfer && (() => (existing ? form.save(onTransfer) : form.startDraft(onTransfer)))}
        transferNeedsScore={Boolean(existing)}
        onCancel={onCancel}
      />
    </>
  );

  return (
    <form onSubmit={handleSubmit}>
      {layout === "desk" ? (
        <ReviewDesk
          form={form}
          game={game}
          accent={accent}
          footer={footer}
          strip={strip}
          earlierTake={form.draft ? revisionTake?.earlier : null}
          scorecard={
            <ReviewScorecardEditor
              value={facets}
              onChange={form.setFacets}
              overall={form.rating}
              // The average is offered, never imposed — see the footer's comment.
              onUseAverage={form.setRating}
              accent={accent}
              disabled={pending}
            />
          }
        />
      ) : (
        <QuickSheet
          form={form}
          accent={accent}
          footer={footer}
          note={
            facets && (
              // Says the scorecard is still there and where to change it.
              // Without this the categories simply vanish from the form,
              // which reads like the save is about to drop them.
              <p className="text-xs text-faint-foreground">
                Scored on {facets.order.length}{" "}
                {facets.order.length === 1 ? "category" : "categories"}, kept as
                they are. Open the full review editor to change them.
              </p>
            )
          }
        />
      )}
    </form>
  );
}

