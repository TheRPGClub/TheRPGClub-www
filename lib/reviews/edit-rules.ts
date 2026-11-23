import type { Review } from "@/lib/api/types";

// The Edit rules (ADR 0013): an Edit may change a take's score only in its
// first 7 days after publishing; an Edit more than an hour after publishing
// shows "Edited <date>" by the byline. The API enforces both; these read
// them so the page can show them before the member tries.

export const SCORE_LOCK_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;
const EDITED_GRACE_MS = 60 * 60 * 1000;

type Dated = Pick<Review, "published_at" | "score_locks_at">;

function time(at: string | null | undefined): number | null {
  if (!at) return null;
  const t = Date.parse(at);
  return Number.isNaN(t) ? null : t;
}

// When the score stops being editable: the API's `score_locks_at`, or 7 days
// after publishing on a shape that doesn't carry it. Null on a Draft, whose
// score changes freely until it is published.
export function scoreLocksAt(review: Dated): number | null {
  const published = time(review.published_at);
  if (published === null) return null;
  return time(review.score_locks_at) ?? published + SCORE_LOCK_DAYS * DAY_MS;
}

// Whether an Edit made at `now` may no longer change the score.
export function isScoreLocked(review: Dated, now: number): boolean {
  const locksAt = scoreLocksAt(review);
  return locksAt !== null && now > locksAt;
}

// "12 Mar 2025", in UTC like every date on the review pages.
export function editRuleDate(at: number | string): string {
  return new Date(at).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

// The locked ruler's reason. Without a date (a server refusal on a shape
// with no publish date) it still says why.
export function scoreLockReason(locksAt: number | null): string {
  const when = locksAt === null ? "This one has locked." : `This one locked on ${editRuleDate(locksAt)}.`;
  return `A score can change for ${SCORE_LOCK_DAYS} days after publishing. ${when} A new score is a Revision.`;
}

// The date "Edited <date>" shows, or null. The API only sets `edited_at`
// past the hour's grace; the check here keeps a stray value from an older
// row from marking a review that was only tidied straight after publishing.
export function editedAt(review: Pick<Review, "published_at" | "edited_at">): string | null {
  const edited = time(review.edited_at);
  const published = time(review.published_at);
  if (edited === null || published === null) return null;
  return edited - published > EDITED_GRACE_MS ? review.edited_at! : null;
}
