"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteHistoryEventAction } from "@/app/actions/codex-history";
import { HISTORY_PATH } from "@/lib/codex/paths";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";

// Delete on a History Event, after asking. On its desk it returns to the
// Club History; on the timeline (`quiet`, the 2B quiet Delete beside its
// date line, named for the History Event it removes) the timeline reloads
// without it. Shown only where `viewer.can_delete` says so.
export function HistoryDelete({
  id,
  className,
  quiet,
}: {
  id: number;
  className?: string;
  quiet?: { title: string };
}) {
  const router = useRouter();
  return (
    <ConfirmDialog
      trigger={
        quiet ? (
          <Button type="button" variant="quiet-delete" size="xs" aria-label={`Delete ${quiet.title}`} className={className}>
            Delete
          </Button>
        ) : (
          <Button type="button" variant="destructive-outline" className={className}>
            <Trash2 aria-hidden />
            Delete
          </Button>
        )
      }
      title="Delete this History Event?"
      description="Its images and See also links go too. This can't be undone."
      confirmLabel="Delete History Event"
      pendingLabel="Deleting…"
      confirmIcon={quiet ? undefined : <Trash2 aria-hidden />}
      onConfirm={async () => {
        const result = await deleteHistoryEventAction(id);
        if (!result.ok) return result.error ?? "That didn't delete. Try again.";
        if (!quiet) router.push(HISTORY_PATH);
        router.refresh();
        return null;
      }}
    />
  );
}
