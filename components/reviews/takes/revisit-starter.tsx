"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { revisitReviewAction } from "@/app/actions/reviews";
import { ButtonLink } from "@/components/ui/button";
import { reviewHref } from "@/lib/reviews/href";

// `?revisit` before there is a Draft Revision: starts one, then shows the
// page again, which now opens it in the desk. Revisit is a link (the
// Revisit stop, a locked score's "Revisit instead"), so starting happens
// here, once, rather than on a prefetch. A Draft Revision that already
// exists (another tab started it) is opened the same way.
export function RevisitStarter({ userId, reviewId }: { userId: string; reviewId: number }) {
  const router = useRouter();
  const started = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    revisitReviewAction(userId, reviewId)
      .then((result) => {
        if (result.ok || result.code === "draft_revision_exists") router.refresh();
        else setError(result.error ?? "Couldn't start the revision.");
      })
      .catch(() => setError("Couldn't start the revision."));
  }, [router, userId, reviewId]);

  if (!error) {
    return (
      <p role="status" className="py-6 text-sm text-muted-foreground">
        Starting your revision…
      </p>
    );
  }
  return (
    <div role="alert" className="space-y-3 py-6">
      <p className="m-0 text-sm text-destructive">{error}</p>
      <ButtonLink href={reviewHref(reviewId)} variant="outline" size="sm">
        Back to the review
      </ButtonLink>
    </div>
  );
}
