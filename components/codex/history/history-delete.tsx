"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteHistoryEventAction } from "@/app/actions/codex-history";
import { HISTORY_PATH } from "@/lib/codex/paths";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";

// Delete on the History Event desk, after asking; it returns to the Club
// History. Shown only where `viewer.can_delete` says so.
export function HistoryDelete({ id, className }: { id: number; className?: string }) {
  const router = useRouter();
  return (
    <ConfirmDialog
      trigger={
        <Button type="button" variant="destructive-outline" className={className}>
          <Trash2 aria-hidden />
          Delete
        </Button>
      }
      title="Delete this History Event?"
      description="Its images and See also links go too. This can't be undone."
      confirmLabel="Delete History Event"
      pendingLabel="Deleting…"
      confirmIcon={<Trash2 aria-hidden />}
      onConfirm={async () => {
        const result = await deleteHistoryEventAction(id);
        if (!result.ok) return result.error ?? "That didn't delete. Try again.";
        router.push(HISTORY_PATH);
        router.refresh();
        return null;
      }}
    />
  );
}
