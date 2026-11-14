"use client";

import dynamic from "next/dynamic";

// The editor is the heaviest thing a game page can pull in, and most visitors
// never open it — anonymous ones cannot. It loads on demand.
export const LazyReviewForm = dynamic(
  () =>
    import("@/components/member/review-form").then((m) => ({
      default: m.ReviewForm,
    })),
  {
    ssr: false,
    loading: () => (
      <p className="py-6 text-center text-sm text-faint-foreground">
        Loading editor…
      </p>
    ),
  },
);
