"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";
import { MAX_RATING, MIN_RATING, isValidRating } from "@/lib/api/rating";
import { MAX_REVIEW_LENGTH, sanitizeReviewValue } from "@/lib/api/review-body";
import { MAX_REVIEW_TITLE_LENGTH, sanitizeReviewTitle } from "@/lib/api/review-title";
import { WEIGHT_TOTAL, sanitizeReviewFacets } from "@/lib/reviews/facets";
import type { Review } from "@/lib/api/types";
import { richTextPlainText } from "@/lib/rich-text/text";
import { reviewHref } from "@/lib/reviews/href";

export interface ActionResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

// The API's error codes that have words of their own here.
const ERROR_WORDS: Record<string, string> = {
  rating_required: "Give it an overall score before publishing.",
};

async function errorMessage(response: Response): Promise<string> {
  try {
    const body = await response.json();
    if (typeof body.error === "string" && ERROR_WORDS[body.error]) return ERROR_WORDS[body.error];
    return body.error ?? body.message ?? `Request failed (HTTP ${response.status}).`;
  } catch {
    return `Request failed (HTTP ${response.status}).`;
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

  if (!res.ok) return { ok: false, error: await errorMessage(res) };

  const body = (await res.json()) as { data: Review };
  revalidatePath(`/members/${userId}`);
  revalidatePath(`/members/${userId}/reviews`);
  revalidatePath(`/games/${gameId}`);
  revalidatePath(`/games/${gameId}/reviews`);
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
