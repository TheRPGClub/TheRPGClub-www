"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

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
  // Opens straight into the editor. True both on a fresh navigation — the
  // writer arrived from the game page's small editor, which has already
  // saved, so landing them on a read view would make them click straight
  // back out of it — and on an in-place one, from the banner's own edit
  // link (`?edit`), which changes this prop without remounting.
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
  // Tracked so the block below can tell "startEditing changed" from
  // "re-rendered for some other reason" — set (during render, not an
  // effect) only when it actually needs updating.
  const [prevStartEditing, setPrevStartEditing] = useState(startEditing);

  // `startEditing` only seeds `editing` at mount by default. The banner's
  // edit link changes the URL, and therefore this prop, without remounting
  // the page — this is what makes that in-place navigation open the editor
  // too, while still leaving Cancel free to turn `editing` back off without
  // fighting an unchanged prop on the next render.
  if (startEditing !== prevStartEditing) {
    setPrevStartEditing(startEditing);
    if (canEdit && startEditing) setEditing(true);
  }

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

  // The edit trigger itself lives in the banner now — see ReviewBanner's
  // `canEdit` prop — so a reader sees it as part of the review's own header,
  // not as a control floating in the gap above the scorecard.
  return children;
}
