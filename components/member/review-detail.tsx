"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Review } from "@/lib/api/types";
import type { ReviewAccent } from "@/lib/reviews/accent";

// Same reasoning as the game page's list: the editor is the heaviest thing
// here and most readers never open it.
const ReviewForm = dynamic(
  () =>
    import("@/components/member/review-form").then((m) => ({
      default: m.ReviewForm,
    })),
  {
    ssr: false,
    loading: () => (
      <p className="py-6 text-sm text-muted-foreground">Loading editor…</p>
    ),
  },
);

export interface ReviewDetailProps {
  review: Review;
  gameId: number;
  accent: ReviewAccent;
  // Only the author gets the edit affordance.
  canEdit: boolean;
  // Opens straight into the editor. Set when the writer arrived from the game
  // page's small editor, which has already saved — landing them on a read
  // view would make them click Edit to carry on where they left off.
  startEditing?: boolean;
  // The rendered review, passed in already built. It stays a server render
  // that way — the read view is the common one, and it has no business
  // shipping the renderer to the browser just because editing is possible.
  children: React.ReactNode;
}

export function ReviewDetail({
  review,
  gameId,
  accent,
  canEdit,
  startEditing = false,
  children,
}: ReviewDetailProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(canEdit && startEditing);

  if (editing) {
    return (
      <ReviewForm
        userId={review.user_id}
        gameId={gameId}
        existing={review}
        accent={accent}
        showDelete
        onCancel={() => setEditing(false)}
        onSaved={() => setEditing(false)}
        // The review this page is about is gone, so there is nothing to come
        // back to.
        onDeleted={() => router.replace(`/games/${gameId}/reviews`)}
      />
    );
  }

  return (
    <>
      {children}
      {canEdit && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="-ml-2.5 mt-6"
          onClick={() => setEditing(true)}
        >
          <Pencil />
          Edit your review
        </Button>
      )}
    </>
  );
}
