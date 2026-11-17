"use client";

import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { deleteChallengeAction } from "@/app/actions/challenges";
import { Button, ButtonLink } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";

// The Host's tools on their Challenge (and Moderators' on a club-hosted
// one): Edit, and Delete while it has no Runs (staff remove it from the Staff
// menu instead).
export function HostTools({
  challengeId,
  name,
  canEdit,
  canDelete,
}: {
  challengeId: number;
  name: string;
  canEdit: boolean;
  canDelete: boolean;
}) {
  const router = useRouter();
  return (
    <>
      {canEdit && (
        <ButtonLink href={`/challenges/${challengeId}/edit`} variant="outline" size="sm">
          <Pencil aria-hidden /> Edit
        </ButtonLink>
      )}
      {canDelete && (
        <ConfirmDialog
          trigger={
            <Button type="button" variant="destructive-outline" size="sm">
              <Trash2 aria-hidden /> Delete
            </Button>
          }
          title={`Delete ${name}?`}
          description="Nobody has started a Run of it yet. This can't be undone."
          confirmLabel="Delete"
          pendingLabel="Deleting…"
          onConfirm={async () => {
            const result = await deleteChallengeAction(challengeId);
            if (!result.ok) return result.error ?? "That didn't work.";
            router.push("/challenges");
            return null;
          }}
        />
      )}
    </>
  );
}
