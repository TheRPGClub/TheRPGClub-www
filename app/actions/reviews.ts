"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";
import { MAX_RATING, MIN_RATING, isValidRating } from "@/lib/api/rating";
import {
  MAX_REVIEW_LENGTH,
  reviewValueText,
  sanitizeReviewValue,
} from "@/lib/api/review-body";
import type { Review } from "@/lib/api/types";

export interface ActionResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

async function errorMessage(response: Response): Promise<string> {
  try {
    const body = await response.json();
    return body.error ?? body.message ?? `Request failed (HTTP ${response.status}).`;
  } catch {
    return `Request failed (HTTP ${response.status}).`;
  }
}

export interface ReviewInput {
  // Integer 0..100, matching the column's own scale and CHECK constraint.
  // Required — the column is NOT NULL.
  rating: number;
  // A Plate value from the editor. Typed `unknown` on purpose: this crosses
  // the server action boundary, so it is untrusted JSON until
  // `sanitizeReviewValue` has vetted it.
  body: unknown;
  is_shared?: boolean;
}

type Prepared =
  | { ok: true; payload: Record<string, unknown> }
  | { ok: false; error: string };

// Validation and payload building are one step because both need the
// sanitized value, and sanitizing twice risks the two disagreeing about what
// gets stored versus what got measured.
function prepare(input: ReviewInput): Prepared {
  if (!isValidRating(input.rating)) {
    return {
      ok: false,
      error: `Pick a rating between ${MIN_RATING} and ${MAX_RATING}.`,
    };
  }

  // Anything the allowlist doesn't recognise is dropped here rather than
  // trusted — the value lands in a jsonb column that gets rendered back as
  // markup. Returns null for a body with no text, which is what the nullable
  // column wants instead of an empty document.
  const body = sanitizeReviewValue(input.body);

  if (body && reviewValueText(body).length > MAX_REVIEW_LENGTH) {
    return {
      ok: false,
      error: `Review is too long (max ${MAX_REVIEW_LENGTH} chars).`,
    };
  }

  return {
    ok: true,
    payload: {
      rating: input.rating,
      body,
      is_shared: input.is_shared ?? true,
    },
  };
}

export async function createReviewAction(
  userId: string,
  gameId: number,
  input: ReviewInput,
): Promise<ActionResult<Review>> {
  const prepared = prepare(input);
  if (!prepared.ok) return { ok: false, error: prepared.error };

  const res = await apiFetch(`/api/v1/users/${userId}/reviews`, {
    method: "POST",
    body: JSON.stringify({
      data: {
        gamedb_game_id: gameId,
        ...prepared.payload,
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
  revalidatePath(`/games/${gameId}/reviews/${reviewId}`);
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
  return { ok: true, data: null };
}
