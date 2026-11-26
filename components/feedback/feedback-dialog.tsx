"use client";

import { useRouter } from "next/navigation";
import { pinnedHref, type FeedbackDialogState } from "@/lib/feedback";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { FeedbackForm } from "./feedback-form";

// The Give feedback dialog over the Feedback Board, opened by the board's
// URL (`?new=1[&kind=]`, or `?edit=<id>` for the author's Pending one) so a
// link from Discord opens it too. Closing goes back to the board as it was;
// posting lands on the board with the card pinned. A request it can't honour
// says why.
export function FeedbackDialog({ state, closeHref }: { state: FeedbackDialogState | null; closeHref: string }) {
  const router = useRouter();
  // A Bug Report this dialog created but for its screenshot is on the
  // board: close onto it. Cancelling an edit goes back to the board as it was.
  const close = (createdId = 0) =>
    router.replace(createdId ? pinnedHref({ feedback_id: createdId }) : closeHref, { scroll: false });

  return (
    <Dialog open={!!state} onOpenChange={(open) => !open && close()}>
      {state?.mode === "refused" && (
        <DialogContent>
          <DialogTitle>Can&apos;t open that</DialogTitle>
          <DialogDescription>{state.message}</DialogDescription>
          <DialogClose render={<Button variant="outline" className="self-end" />}>Back to the board</DialogClose>
        </DialogContent>
      )}
      {state && state.mode !== "refused" && (
        <FeedbackForm
          key={state.mode === "edit" ? `edit-${state.feedback.feedback_id}` : "create"}
          kind={state.mode === "edit" ? state.feedback.kind : state.kind}
          feedback={state.mode === "edit" ? state.feedback : null}
          onCancel={close}
        />
      )}
    </Dialog>
  );
}
