"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

import { deleteReviewAction } from "@/app/actions/reviews";
import { Button } from "@/components/ui/button";
import { useTakeDelete } from "@/hooks/use-take-delete";
import { STOP_ROW } from "./revisit-stop";
import { TakeConfirm } from "./take-confirm";

// The foot of the score line, for the author: Delete review, which takes
// every take with it. The question opens in place.
export function DeleteReviewFoot({
  owner,
  note,
}: {
  owner: { userId: string; reviewId: number; gameId: number };
  // "Every take goes with it, all 2 Revisions included."
  note: string;
}) {
  const router = useRouter();
  const del = useTakeDelete(
    () => deleteReviewAction(owner.userId, owner.reviewId, owner.gameId),
    () => router.replace(`/games/${owner.gameId}/reviews`),
  );
  return (
    <div className={STOP_ROW}>
      <div className="max-md:hidden" />
      <div className="min-w-0 space-y-3 border-t border-dashed border-border-strong pt-3.5">
        {del.asking ? (
          <TakeConfirm
            title="Delete this review?"
            note={note}
            confirmLabel="Delete review"
            pending={del.pending}
            error={del.error}
            onConfirm={del.confirm}
            onKeep={del.keep}
          />
        ) : (
          <div className="flex items-center justify-end">
            <Button type="button" variant="destructive-outline" size="sm" onClick={del.ask}>
              <Trash2 />
              Delete review
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
