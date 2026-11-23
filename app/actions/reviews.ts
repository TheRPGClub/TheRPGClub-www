"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";
import { MAX_RATING, MIN_RATING, isValidRating } from "@/lib/api/rating";
import { MAX_REVIEW_LENGTH, sanitizeReviewValue } from "@/lib/api/review-body";
import { MAX_REVIEW_TITLE_LENGTH, sanitizeReviewTitle } from "@/lib/api/review-title";
import { WEIGHT_TOTAL, sanitizeReviewFacets } from "@/lib/reviews/facets";
import type { Review, ReviewRevision } from "@/lib/api/types";
import { richTextPlainText } from "@/lib/rich-text/text";
import { reviewHref } from "@/lib/reviews/href";

export interface ActionResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
  // The API's error code, when it sent one (`score_locked`), so the form can
  // show a refusal in place rather than only as words.
  code?: string;
}

// The API's error codes that have words of their own here.
const ERROR_WORDS: Record<string, string> = {
  draft_revision_exists: "You're already revisiting this review: carry on with that draft.",
  review_not_published: "Publish the review before revisiting it.",
  rating_required: "Give it an overall score before publishing.",
  score_locked:
    "The score is locked now, so nothing was saved. It's back to the published score: save again to keep your other changes.",
};

async function errorMessage(response: Response): Promise<string> {
  return (await failure(response)).error!;
}

// A refused request as an ActionResult: the words, and the API's code.
async function failure(response: Response): Promise<ActionResult<never>> {
  try {
    const body = await response.json();
    const code = typeof body.error === "string" ? body.error : undefined;
    if (code && ERROR_WORDS[code]) return { ok: false, error: ERROR_WORDS[code], code };
    return { ok: false, error: body.error ?? body.message ?? `Request failed (HTTP ${response.status}).`, code };
  } catch {
    return { ok: false, error: `Request failed (HTTP ${response.status}).` };
  }
}

export interface ReviewInput {
  // Untrusted like `body` below, for the same reason: it crosses the server
  // action boundary as whatever the client sent. Optional — most reviews
  // don't have one.
  title?: unknown;
  // Integer 0..100, matching the column's own scale and CHECK constraint.
  // Null only on a Draft that has no score yet: publishing needs one.
  rating: number | null;
  // A Plate value from the editor. Typed `unknown` on purpose: this crosses
  // the server action boundary, so it is untrusted JSON until
  // `sanitizeReviewValue` has vetted it.
  body: unknown;
  // The per-category scorecard, `unknown` for the same reason. null (or a
  // scorecard with no facets on it) is a quick take, which is what every
  // review written before the scorecard existed already is.
  facets?: unknown;
}

function sentWeights(facets: unknown): boolean {
  return (
    typeof facets === "object" &&
    facets !== null &&
    !Array.isArray(facets) &&
    (facets as Record<string, unknown>).weights != null
  );
}

type Prepared =
  | { ok: true; payload: Record<string, unknown> }
  | { ok: false; error: string };

// Validation and payload building are one step because both need the
// sanitized value, and sanitizing twice risks the two disagreeing about what
// gets stored versus what got measured.
//
// `draft` lets the score be empty: a Draft may have none until it is published.
function prepare(input: ReviewInput, { draft = false } = {}): Prepared {
  const unrated = draft && input.rating === null;
  if (!unrated && !isValidRating(input.rating)) {
    return {
      ok: false,
      error: `Pick a rating between ${MIN_RATING} and ${MAX_RATING}.`,
    };
  }

  const title = sanitizeReviewTitle(input.title);
  if (title && title.length > MAX_REVIEW_TITLE_LENGTH) {
    return {
      ok: false,
      error: `Title is too long (max ${MAX_REVIEW_TITLE_LENGTH} chars).`,
    };
  }

  // Anything the allowlist doesn't recognise is dropped here rather than
  // trusted — the value lands in a jsonb column that gets rendered back as
  // markup. Returns null for a body with no text, which is what the nullable
  // column wants instead of an empty document.
  const body = sanitizeReviewValue(input.body);

  if (body && richTextPlainText(body).length > MAX_REVIEW_LENGTH) {
    return {
      ok: false,
      error: `Review is too long (max ${MAX_REVIEW_LENGTH} chars).`,
    };
  }

  const facets = sanitizeReviewFacets(input.facets);

  // The sanitizer drops a weighting it cannot vouch for, which is right for
  // reading someone else's row but wrong for saving your own — it would look
  // like the weights simply never took. If the caller sent weights and none
  // survived, say so instead.
  if (facets && !facets.weights && sentWeights(input.facets)) {
    return {
      ok: false,
      error: `Category weights must cover every category and add up to ${WEIGHT_TOTAL}%.`,
    };
  }

  return {
    ok: true,
    payload: {
      // Always sent, null included: clearing an existing title is a real
      // edit, same reasoning as `facets` below.
      title,
      rating: input.rating,
      body,
      // Always sent, null included: clearing a scorecard on an existing review
      // is a real edit, and omitting the key would leave the old one in place.
      // Unknown facets and out-of-range scores are dropped here rather than
      // trusted; the API validates the same shape again on its side.
      facets,
    },
  };
}

// Writes a new Review. `publish` is the game page's quick take, created and
// published in one call; without it the Review starts as a Draft (the full
// editor's), which may have no score yet.
export async function createReviewAction(
  userId: string,
  gameId: number,
  input: ReviewInput,
  { publish }: { publish: boolean },
): Promise<ActionResult<Review>> {
  const prepared = prepare(input, { draft: !publish });
  if (!prepared.ok) return { ok: false, error: prepared.error };

  const res = await apiFetch(`/api/v1/users/${userId}/reviews`, {
    method: "POST",
    body: JSON.stringify({
      data: {
        gamedb_game_id: gameId,
        ...prepared.payload,
        publish,
      },
    }),
  });

  if (!res.ok) return { ok: false, error: await errorMessage(res) };

  const body = (await res.json()) as { data: Review };
  revalidatePath(`/members/${userId}`);
  revalidatePath(`/members/${userId}/reviews`);
  revalidatePath(`/games/${gameId}`);
  revalidatePath(`/games/${gameId}/reviews`);
  return { ok: true, data: body.data };
}

export async function updateReviewAction(
  userId: string,
  reviewId: number,
  gameId: number,
  input: ReviewInput,
): Promise<ActionResult<Review>> {
  const prepared = prepare(input);
  if (!prepared.ok) return { ok: false, error: prepared.error };

  const res = await apiFetch(`/api/v1/reviews/${reviewId}`, {
    method: "PATCH",
    body: JSON.stringify({ data: prepared.payload }),
  });

  // `score_locked` keeps its code: the editor locks the ruler on it.
  if (!res.ok) return failure(res);

  const body = (await res.json()) as { data: Review };
  revalidatePath(`/members/${userId}`);
  revalidatePath(`/members/${userId}/reviews`);
  revalidatePath(`/games/${gameId}`);
  revalidatePath(`/games/${gameId}/reviews`);
  revalidatePath("/reviews");
  revalidatePath(reviewHref(reviewId));
  return { ok: true, data: body.data };
}

export async function deleteReviewAction(
  userId: string,
  reviewId: number,
  gameId: number,
): Promise<ActionResult<null>> {
  const res = await apiFetch(`/api/v1/reviews/${reviewId}`, {
    method: "DELETE",
  });

  if (!res.ok) return { ok: false, error: await errorMessage(res) };

  revalidatePath(`/members/${userId}`);
  revalidatePath(`/members/${userId}/reviews`);
  revalidatePath(`/games/${gameId}`);
  revalidatePath(`/games/${gameId}/reviews`);
  // A discarded Draft leaves the pile and the feed's drafts row.
  revalidatePath("/reviews");
  revalidatePath("/reviews/drafts");
  return { ok: true, data: null };
}

// The Draft's autosave. Nothing is revalidated: a Draft shows nowhere but its
// own editor, and refreshing the page mid-sentence would fight the writer.
export async function saveDraftAction(
  reviewId: number,
  input: ReviewInput,
): Promise<ActionResult<Review>> {
  const prepared = prepare(input, { draft: true });
  if (!prepared.ok) return { ok: false, error: prepared.error };

  const res = await apiFetch(`/api/v1/reviews/${reviewId}`, {
    method: "PATCH",
    body: JSON.stringify({ data: prepared.payload }),
  });
  if (!res.ok) return { ok: false, error: await errorMessage(res) };

  const body = (await res.json()) as { data: Review };
  return { ok: true, data: body.data };
}

// Publishes a Draft. The API refuses one with no score (`rating_required`);
// the editor never offers Publish without one, so that refusal only comes
// from a stale page.
export async function publishReviewAction(
  userId: string,
  reviewId: number,
  gameId: number,
): Promise<ActionResult<Review>> {
  const res = await apiFetch(`/api/v1/reviews/${reviewId}/publish`, {
    method: "POST",
  });
  if (!res.ok) return { ok: false, error: await errorMessage(res) };

  const body = (await res.json()) as { data: Review };
  revalidatePath(`/members/${userId}`);
  revalidatePath(`/members/${userId}/reviews`);
  revalidatePath(`/games/${gameId}`);
  revalidatePath(`/games/${gameId}/reviews`);
  revalidatePath("/reviews");
  revalidatePath(reviewHref(reviewId));
  return { ok: true, data: body.data };
}

// ---------------------------------------------------------------------------
// Revisions: dated returns to a Published Review. Each take is written like
// a Review (the same validation), under /review_revisions/:id.

// Everywhere the Review's score shows: a published or deleted Revision moves
// it (the current score is the latest Published Revision's).
function revalidateReview(userId: string, reviewId: number, gameId: number) {
  revalidatePath(`/members/${userId}`);
  revalidatePath(`/members/${userId}/reviews`);
  revalidatePath(`/games/${gameId}`);
  revalidatePath(`/games/${gameId}/reviews`);
  revalidatePath("/reviews");
  revalidatePath("/reviews/drafts");
  revalidatePath(reviewHref(reviewId));
}

// Revisit: starts the Review's Draft Revision, empty. The API allows one at a
// time (`draft_revision_exists`) and only on a Published Review.
export async function revisitReviewAction(
  userId: string,
  reviewId: number,
): Promise<ActionResult<ReviewRevision>> {
  const res = await apiFetch(`/api/v1/reviews/${reviewId}/revisions`, {
    method: "POST",
    body: JSON.stringify({ data: {} }),
  });
  if (!res.ok) return failure(res);
  const body = (await res.json()) as { data: ReviewRevision };
  // The pile and the feed's drafts row gain it.
  revalidatePath("/reviews");
  revalidatePath("/reviews/drafts");
  revalidatePath(`/members/${userId}/reviews`);
  return { ok: true, data: body.data };
}

// A Draft Revision's autosave. Nothing is revalidated, as for a Draft.
export async function saveRevisionDraftAction(
  revisionId: number,
  input: ReviewInput,
): Promise<ActionResult<ReviewRevision>> {
  const prepared = prepare(input, { draft: true });
  if (!prepared.ok) return { ok: false, error: prepared.error };
  const res = await apiFetch(`/api/v1/review_revisions/${revisionId}`, {
    method: "PATCH",
    body: JSON.stringify({ data: prepared.payload }),
  });
  if (!res.ok) return { ok: false, error: await errorMessage(res) };
  const body = (await res.json()) as { data: ReviewRevision };
  return { ok: true, data: body.data };
}

// The Edit of a Published Revision: explicit Save, under its own score lock.
export async function updateRevisionAction(
  userId: string,
  revision: { reviewId: number; revisionId: number },
  gameId: number,
  input: ReviewInput,
): Promise<ActionResult<ReviewRevision>> {
  const prepared = prepare(input);
  if (!prepared.ok) return { ok: false, error: prepared.error };
  const res = await apiFetch(`/api/v1/review_revisions/${revision.revisionId}`, {
    method: "PATCH",
    body: JSON.stringify({ data: prepared.payload }),
  });
  // `score_locked` keeps its code: the editor locks the ruler on it.
  if (!res.ok) return failure(res);
  const body = (await res.json()) as { data: ReviewRevision };
  revalidateReview(userId, revision.reviewId, gameId);
  return { ok: true, data: body.data };
}

// Publishes a Draft Revision: its score becomes the Review's.
export async function publishRevisionAction(
  userId: string,
  revision: { reviewId: number; revisionId: number },
  gameId: number,
): Promise<ActionResult<ReviewRevision>> {
  const res = await apiFetch(`/api/v1/review_revisions/${revision.revisionId}/publish`, {
    method: "POST",
  });
  if (!res.ok) return { ok: false, error: await errorMessage(res) };
  const body = (await res.json()) as { data: ReviewRevision };
  revalidateReview(userId, revision.reviewId, gameId);
  return { ok: true, data: body.data };
}

// Deletes a Revision (a Draft's Discard, or Delete revision on a Published
// one). The Review's score goes back to the take before it.
export async function deleteRevisionAction(
  userId: string,
  revision: { reviewId: number; revisionId: number },
  gameId: number,
): Promise<ActionResult<null>> {
  const res = await apiFetch(`/api/v1/review_revisions/${revision.revisionId}`, {
    method: "DELETE",
  });
  if (!res.ok) return { ok: false, error: await errorMessage(res) };
  revalidateReview(userId, revision.reviewId, gameId);
  return { ok: true, data: null };
}
