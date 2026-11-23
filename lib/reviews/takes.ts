import type { Review, ReviewBody, ReviewFacets, ReviewRevision } from "@/lib/api/types";
import { editRuleDate } from "@/lib/reviews/edit-rules";

// A Review's Published takes: the first take (the Review itself) and each
// Published Revision after it. The latest one's score is the Review's.

export interface Take {
  // A stable key: "review", or "revision-7".
  key: string;
  // Null on the first take.
  revisionId: number | null;
  // "First take", "Revision 1", "Revision 2".
  label: string;
  rating: number | null;
  // The score just before this take; null on the first.
  previousRating: number | null;
  title: string | null;
  body: ReviewBody;
  facets: ReviewFacets | null;
  publishedAt: string | null;
  editedAt: string | null;
  scoreLocksAt: string | null;
  // The latest take: its score is the Review's.
  current: boolean;
}

type TakeSource = Pick<
  Review,
  | "rating"
  | "original_rating"
  | "revisions"
  | "title"
  | "body"
  | "facets"
  | "published_at"
  | "edited_at"
  | "score_locks_at"
  | "created_at"
>;

// Every Published take, oldest first.
export function reviewTakes(review: TakeSource): Take[] {
  const revisions = (review.revisions ?? []).filter((r) => r.published_at != null);
  const first: Take = {
    key: "review",
    revisionId: null,
    label: "First take",
    // `original_rating` is the first take's own; older shapes only carry
    // `rating`, which is the same score when there are no Revisions.
    rating: review.original_rating !== undefined ? review.original_rating : review.rating,
    previousRating: null,
    title: review.title ?? null,
    body: review.body,
    facets: review.facets,
    publishedAt: review.published_at ?? review.created_at,
    editedAt: review.edited_at ?? null,
    scoreLocksAt: review.score_locks_at ?? null,
    current: revisions.length === 0,
  };
  return [
    first,
    ...revisions.map((r, i): Take => revisionTake(r, i + 1, i === revisions.length - 1)),
  ];
}

function revisionTake(r: ReviewRevision, n: number, current: boolean): Take {
  return {
    key: `revision-${r.revision_id}`,
    revisionId: r.revision_id,
    label: `Revision ${n}`,
    rating: r.rating,
    previousRating: r.previous_rating,
    title: r.title ?? null,
    body: r.body,
    facets: r.facets,
    publishedAt: r.published_at,
    editedAt: r.edited_at ?? null,
    scoreLocksAt: r.score_locks_at ?? null,
    current,
  };
}

// "+13", "−5" (a true minus), or "=" for no change.
export function signedChange(rating: number, previous: number): string {
  const d = rating - previous;
  if (d > 0) return `+${d}`;
  if (d < 0) return `−${-d}`;
  return "=";
}

// The change under a take's score box: "−5 from 85", "Same as 80", or "The
// first score".
export function scoreChange(rating: number | null, previous: number | null): string {
  if (previous === null) return "The first score";
  if (rating === null) return `Was ${previous}`;
  if (rating === previous) return `Same as ${previous}`;
  return `${signedChange(rating, previous)} from ${previous}`;
}

export interface ScoreRowStop {
  rating: number;
  // "Nov 24", or "Now" on the current score.
  label: string;
  current: boolean;
  // The change from the stop before; null on the first.
  change: string | null;
}

// The banner's score row, oldest first: 72 +13 85 −5 80. Empty for a Review
// that was never revisited, where the row would only repeat the score.
export function scoreRow(takes: Take[]): ScoreRowStop[] {
  const scored = takes.filter((t): t is Take & { rating: number } => t.rating !== null);
  if (scored.length < 2) return [];
  return scored.map((t, i) => ({
    rating: t.rating,
    label: t.current ? "Now" : shortMonth(t.publishedAt),
    current: t.current,
    change: i === 0 ? null : signedChange(t.rating, scored[i - 1].rating),
  }));
}

// "Nov 24", in UTC.
function shortMonth(at: string | null): string {
  if (!at) return "";
  const d = new Date(at);
  if (Number.isNaN(d.getTime())) return "";
  const month = d.toLocaleDateString("en-GB", { month: "short", timeZone: "UTC" });
  return `${month} ${String(d.getUTCFullYear()).slice(2)}`;
}

// A stop's date: the day as a numeral and the month under it ("02", "Mar
// 2025"), in UTC.
export function stopDate(at: string | null): { day: string; month: string } {
  const d = at ? new Date(at) : null;
  if (!d || Number.isNaN(d.getTime())) return { day: "", month: "" };
  return {
    day: String(d.getUTCDate()).padStart(2, "0"),
    month: d.toLocaleDateString("en-GB", { month: "short", year: "numeric", timeZone: "UTC" }),
  };
}

// "· revisited twice" in the byline.
export function revisedCount(takes: Take[]): string | null {
  const n = takes.length - 1;
  if (n < 1) return null;
  if (n === 1) return "revisited once";
  if (n === 2) return "revisited twice";
  return `revisited ${n} times`;
}

// The latest "Edited" date across the takes, for the banner's marker.
export function latestEdit(takes: Take[], editedAt: (t: Take) => string | null): string | null {
  return takes
    .map(editedAt)
    .filter((at): at is string => at !== null)
    .reduce<string | null>((a, b) => (a === null || Date.parse(b) > Date.parse(a) ? b : a), null);
}

// The headline the banner sets: the newest take's own title, else an older
// one's. Null when no take has one (the game's name takes the headline).
export function headlineTitle(takes: Take[]): string | null {
  for (let i = takes.length - 1; i >= 0; i--) {
    const title = takes[i].title?.trim();
    if (title) return title;
  }
  return null;
}

// What deleting a Revision does, in the question that confirms it: "Its take
// and scorecard go. The score goes back to 85, from 2 Mar 2025." Only the
// current take moves the score; an older one leaves it.
export function revisionDeleteNote(takes: Take[], key: string): string {
  const i = takes.findIndex((t) => t.key === key);
  const take = takes[i];
  if (!take) return "Its take and scorecard go.";
  if (!take.current) return "Its take and scorecard go. The score stays as it is.";
  const before = takes[i - 1];
  if (!before || before.rating === null) return "Its take and scorecard go.";
  const when = before.publishedAt ? `, from ${editRuleDate(before.publishedAt)}` : "";
  return `Its take and scorecard go. The score goes back to ${before.rating}${when}.`;
}

// Whether the Review has a newer take than its first: the lists' `revised`
// flag, else the full shape's Published Revisions.
export function isRevisited(review: Pick<Review, "revised" | "revisions">): boolean {
  if (review.revised !== undefined) return review.revised;
  return (review.revisions ?? []).some((r) => r.published_at != null);
}

// What deleting the whole Review takes with it.
export function reviewDeleteNote(takes: Take[]): string {
  const revisions = takes.length - 1;
  if (revisions === 0) return "Every member loses it, score and all.";
  return `Every take goes with it, ${revisions === 1 ? "its Revision" : `all ${revisions} Revisions`} included.`;
}

// What the desk needs to open a Revision from the review page: a Draft
// Revision answers the current take (taped above Overall), and either kind
// carries its own delete note.
export function revisionTakeFor(revision: ReviewRevision | null, takes: Take[]) {
  if (!revision) return null;
  return {
    revision,
    earlier: revision.published_at == null ? takes[takes.length - 1] : null,
    deleteNote: revisionDeleteNote(takes, `revision-${revision.revision_id}`),
  };
}
