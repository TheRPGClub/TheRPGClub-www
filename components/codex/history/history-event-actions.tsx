"use client";

import { useRouter } from "next/navigation";
import { deleteHistoryEventAction } from "@/app/actions/codex-history";
import { editHistoryPath } from "@/lib/codex/paths";
import { cn } from "@/lib/utils";
import { Button, ButtonLink } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";

// A History Event's quiet Edit and Delete (2B), from its `viewer` flags, at
// the right of its date line: shown on hover or focus where there is a
// pointer that hovers, always on touch screens. Delete asks first.
export function HistoryEventActions({
  id,
  title,
  canEdit,
  canDelete,
}: {
  id: number;
  title: string;
  canEdit: boolean;
  canDelete: boolean;
}) {
  const router = useRouter();
  if (!canEdit && !canDelete) return null;
  return (
    <div
      className={cn(
        "ml-auto flex shrink-0 items-center gap-1 transition-opacity",
        "[@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover/event:opacity-100 [@media(hover:hover)]:group-focus-within/event:opacity-100",
      )}
    >
      {canEdit && (
        <ButtonLink href={editHistoryPath(id)} variant="quiet-link" size="xs" aria-label={`Edit ${title}`}>
          Edit
        </ButtonLink>
      )}
      {canDelete && (
        <ConfirmDialog
          trigger={
            <Button type="button" variant="quiet-delete" size="xs" aria-label={`Delete ${title}`}>
              Delete
            </Button>
          }
          title="Delete this History Event?"
          description="Its images and See also links go too. This can't be undone."
          confirmLabel="Delete History Event"
          pendingLabel="Deleting…"
          onConfirm={async () => {
            const result = await deleteHistoryEventAction(id);
            if (!result.ok) return result.error ?? "That didn't delete. Try again.";
            router.refresh();
            return null;
          }}
        />
      )}
    </div>
  );
}
