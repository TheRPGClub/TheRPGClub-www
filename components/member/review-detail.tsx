"use client";

import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

import type { Review } from "@/lib/api/types";
import type { ReviewAccent } from "@/lib/reviews/accent";
import type { ReviewDeskGame } from "@/components/member/review-desk/desk-game";

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
  // The game, for the editor's banner.
  game: ReviewDeskGame;
  accent: ReviewAccent;
  // Only the author gets the edit affordance.
  canEdit: boolean;
  // Whether the page is in its editing state (`?edit`). The URL owns it, so
  // the page can put its own banner aside while the editor's banner takes
  // its place, and so Cancel and Save, which drop `?edit`, bring the page's
  // banner back with whatever was saved. True on a fresh navigation too: the
  // writer arriving from the game page's small editor has already saved, so
  // landing them on a read view would make them click straight back out.
  startEditing?: boolean;
  // The rendered review, passed in already built. It stays a server render
  // that way — the read view is the common one, and it has no business
  // shipping the renderer to the browser just because editing is possible.
  children: React.ReactNode;
}

export function ReviewDetail({
  review,
  gameId,
  game,
  accent,
  canEdit,
  startEditing = false,
  children,
}: ReviewDetailProps) {
  const router = useRouter();
  const readView = `/games/${gameId}/reviews/${review.review_id}`;

  if (canEdit && startEditing) {
    return (
      <ReviewForm
        userId={review.user_id}
        gameId={gameId}
        game={game}
        existing={review}
        accent={accent}
        showDelete
        onCancel={() => router.replace(readView, { scroll: false })}
        onSaved={() => router.replace(readView, { scroll: false })}
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
