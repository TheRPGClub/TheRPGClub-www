"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteLoreEntryAction } from "@/app/actions/codex-lore";
import { LORE_PATH } from "@/lib/codex/paths";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";

// Delete on a Lore Entry, after asking; it returns to the shelf. Shown only
// where `viewer.can_delete` says so.
export function LoreDelete({
  id,
  size = "default",
  quiet = false,
  className,
}: {
  id: number;
  size?: "default" | "sm";
  // A quiet ghost after another action (the shelf's slide-out).
  quiet?: boolean;
  className?: string;
}) {
  const router = useRouter();
  return (
    <ConfirmDialog
      trigger={
        <Button
          type="button"
          variant={quiet ? "destructive-ghost" : "destructive-outline"}
          size={size}
          className={className}
        >
          <Trash2 aria-hidden />
          Delete
        </Button>
      }
      title="Delete this Lore Entry?"
      description="Its images and See also links go too. This can't be undone."
      confirmLabel="Delete Lore Entry"
      pendingLabel="Deleting…"
      confirmIcon={<Trash2 aria-hidden />}
      onConfirm={async () => {
        const result = await deleteLoreEntryAction(id);
        if (!result.ok) return result.error ?? "That didn't delete. Try again.";
        router.push(LORE_PATH);
        router.refresh();
        return null;
      }}
    />
  );
}
