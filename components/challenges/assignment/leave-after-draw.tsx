"use client";

import { leaveEditionAction } from "@/app/actions/challenge-editions";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";

// Leaving an Edition after the draw, until the pick deadline: it drops the
// Santa's pick (their recipient gets a random one at the deadline) and
// Abandons their own Run, so it asks first. A refusal shows in the dialog.
export function LeaveAfterDraw({
  editionId,
  year,
  recipient,
}: {
  editionId: number;
  year: number;
  recipient: string | null;
}) {
  return (
    <ConfirmDialog
      trigger={
        <Button type="button" variant="inverse-link" size="sm">
          Leave this Edition
        </Button>
      }
      title={`Leave Edition ${year}?`}
      description={`Your pick is dropped and ${recipient ?? "the member you pick for"} gets a random game from their backlog at the deadline. Your own Run is Abandoned. This can't be undone.`}
      confirmLabel="Leave"
      pendingLabel="Leaving…"
      onConfirm={async () => {
        const result = await leaveEditionAction(editionId);
        return result.ok ? null : (result.error ?? "That didn't work. Try again.");
      }}
    />
  );
}
