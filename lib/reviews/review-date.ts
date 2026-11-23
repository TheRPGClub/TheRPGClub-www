// A review's date, one form everywhere a review shows one (the byline, the
// verdict, the cards, the desk and the takes): "Oct 14, 2026", or
// "October 14, 2026" with the long month. In UTC, so the server and the
// browser agree on the day.
export function formatReviewDate(at: string | number, month: "short" | "long" = "short"): string {
  return new Date(at).toLocaleDateString("en-US", {
    year: "numeric",
    month,
    day: "numeric",
    timeZone: "UTC",
  });
}

// The date a review is dated by: when it was published, or when it was
// written for a shape without a publish date.
export function reviewDate(review: { published_at?: string | null; created_at: string }): string {
  return review.published_at ?? review.created_at;
}
