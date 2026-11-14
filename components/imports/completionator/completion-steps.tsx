import type { ReactNode } from "react";
import { AddCompletion } from "@/components/imports/completionator/add-completion";
import { ConfirmSame } from "@/components/imports/completionator/confirm-same";
import { UpdateCompletion } from "@/components/imports/completionator/update-completion";
import type { CompletionatorStepProps } from "@/components/imports/completionator/types";

// The steps after the game is chosen: add the completion, or, when the
// member already has one, confirm it's the same and pick what to update.
// Skip sits under every step.
export function CompletionSteps({
  sameCompletion,
  onSameCompletion,
  skip,
  ...props
}: CompletionatorStepProps & {
  // The member's answer to confirm_same; null until they answer.
  sameCompletion: boolean | null;
  onSameCompletion: (same: boolean | null) => void;
  skip: ReactNode;
}) {
  const { review, disabled } = props;
  let step = review.next_step;
  if (step === "confirm_same" && sameCompletion !== null) {
    step = sameCompletion ? "update_completion" : "add_completion";
  }

  return (
    <>
      {step === "add_completion" ? (
        <AddCompletion
          key="add"
          {...props}
          onBack={sameCompletion === false ? () => onSameCompletion(null) : undefined}
        />
      ) : step === "confirm_same" ? (
        <ConfirmSame review={review} disabled={disabled} onAnswer={onSameCompletion} />
      ) : step === "update_completion" ? (
        <UpdateCompletion
          {...props}
          onBack={sameCompletion === true ? () => onSameCompletion(null) : undefined}
        />
      ) : null}
      <div className="flex justify-end border-t border-border pt-4">{skip}</div>
    </>
  );
}
