"use client";

import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

import type { Review } from "@/lib/api/types";
import { isDraft } from "@/lib/reviews/draft";
import type { ReviewAccent } from "@/lib/reviews/accent";
import type { ReviewDeskGame } from "@/components/member/review-desk/desk-game";
import { reviewHref } from "@/lib/reviews/href";
import type { RevisionTake } from "@/components/member/review-form";
import { RevisitStarter } from "@/components/reviews/takes/revisit-starter";

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
  // The take being edited when it is a Revision (a Draft Revision, or a
  // Published one under `?revision`); absent, the first take.
  revisionTake?: RevisionTake | null;
  // `?revisit` with no Draft Revision yet: start one, then open it.
  startRevisit?: boolean;
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
  revisionTake,
  startRevisit = false,
  children,
}: ReviewDetailProps) {
  const router = useRouter();
  const readView = reviewHref(review.review_id);

  if (canEdit && startRevisit) {
    return <RevisitStarter userId={review.user_id} reviewId={review.review_id} />;
  }

  if (canEdit && startEditing) {
    const draft = isDraft(review);
    return (
      <ReviewForm
        userId={review.user_id}
        gameId={gameId}
        game={game}
        existing={review}
        revisionTake={revisionTake}
        // Remounts the form for another take, so its fields start afresh.
        key={revisionTake ? `revision-${revisionTake.revision.revision_id}` : "review"}
        accent={accent}
        showDelete
        onCancel={() => router.replace(readView, { scroll: false })}
        onSaved={() => router.replace(readView, { scroll: false })}
        // Published: the read view, now with the page's own banner. Refresh
        // too, as the page above the editor was rendered for a Draft.
        onPublished={() => {
          router.replace(readView);
          router.refresh();
        }}
        // The review this page is about is gone, so there is nothing to come
        // back to. A discarded Draft goes back to its game.
        // A Revision's page is still there, one take shorter.
        onDeleted={() => {
          if (revisionTake) {
            router.replace(readView);
            router.refresh();
          } else router.replace(draft ? `/games/${gameId}` : `/games/${gameId}/reviews`);
        }}
      />
    );
  }

  // The edit trigger itself lives in the banner now — see ReviewBanner's
  // `canEdit` prop — so a reader sees it as part of the review's own header,
  // not as a control floating in the gap above the scorecard.
  return children;
}
