"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";
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

// UI captures 1..5 stars; backend stores integer 0..100. Map at the boundary
// so the form stays simple but the wire shape matches the CHECK constraint.
const STAR_TO_RATING = 20;

export interface ReviewInput {
  // 1..5 (stars). Required — the backend column is NOT NULL.
  stars: number;
  body: string;
  is_shared?: boolean;
}

function validate(input: ReviewInput): string | null {
  if (!Number.isInteger(input.stars) || input.stars < 1 || input.stars > 5) {
    return "Pick a rating between 1 and 5 stars.";
  }
  const trimmed = input.body.trim();
  if (trimmed.length > 8000) return "Review is too long (max 8000 chars).";
  return null;
}

function buildPayload(input: ReviewInput): Record<string, unknown> {
  const trimmed = input.body.trim();
  return {
    rating: input.stars * STAR_TO_RATING,
    // Backend column is nullable text — send null instead of empty string so
    // "no body" reviews don't store stray whitespace.
    body: trimmed.length > 0 ? trimmed : null,
    is_shared: input.is_shared ?? true,
  };
}

export async function createReviewAction(
  userId: string,
  gameId: number,
  input: ReviewInput,
): Promise<ActionResult<Review>> {
  const validation = validate(input);
  if (validation) return { ok: false, error: validation };

  const res = await apiFetch(`/api/v1/users/${userId}/reviews`, {
    method: "POST",
    body: JSON.stringify({
      data: {
        gamedb_game_id: gameId,
        ...buildPayload(input),
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
  const validation = validate(input);
  if (validation) return { ok: false, error: validation };

  const res = await apiFetch(`/api/v1/reviews/${reviewId}`, {
    method: "PATCH",
    body: JSON.stringify({ data: buildPayload(input) }),
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
