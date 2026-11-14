import { CompletionDiff } from "@/components/imports/completionator/completion-diff";
import type { CompletionatorReview } from "@/components/imports/completionator/types";
import { ImportSubhead } from "@/components/issue/import-item-layout";
import { Button } from "@/components/ui/button";

// The member already finished this game on another date: the same
// completion (update it) or a separate playthrough (add one)?
export function ConfirmSame({
  review,
  disabled,
  onAnswer,
}: {
  review: CompletionatorReview;
  disabled: boolean;
  onAnswer: (same: boolean) => void;
}) {
  return (
    <section className="space-y-4">
      <div>
        <ImportSubhead>Is this the same completion?</ImportSubhead>
        <p className="mt-1 text-sm text-faint-foreground">
          You already finished this game, on a different date. Update that
          completion, or add this one as a separate playthrough.
        </p>
      </div>
      <CompletionDiff review={review} highlight={review.diff?.fields ?? []} />
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="highlight" disabled={disabled} onClick={() => onAnswer(true)}>
          Yes, update it
        </Button>
        <Button type="button" variant="outline" disabled={disabled} onClick={() => onAnswer(false)}>
          No, add a separate completion
        </Button>
      </div>
    </section>
  );
}
