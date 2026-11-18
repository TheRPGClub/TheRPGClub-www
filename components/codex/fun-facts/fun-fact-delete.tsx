"use client";

import { Trash2 } from "lucide-react";
import { deleteFunFactAction } from "@/app/actions/codex-fun-facts";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";

// Delete on a Fun Fact's card, after asking: deleting is for good, for its
// author and for a Moderator alike.
export function FunFactDelete({ id, number }: { id: number; number: number }) {
  return (
    <ConfirmDialog
      trigger={
        <Button variant="inverse-link" size="inline" className="inline-flex items-center gap-1">
          <Trash2 aria-hidden className="size-3.5" />
          Delete
        </Button>
      }
      title={`Delete Fun Fact No. ${number}?`}
      description="It comes off the wall for good, and the bot won't post it again. This can't be undone."
      confirmLabel="Delete Fun Fact"
      pendingLabel="Deleting…"
      confirmIcon={<Trash2 aria-hidden />}
      onConfirm={async () => {
        const result = await deleteFunFactAction(id);
        return result.ok ? null : (result.error ?? "That didn't delete. Try again.");
      }}
    />
  );
}
