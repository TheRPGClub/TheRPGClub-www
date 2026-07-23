"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";
import { getSession } from "@/lib/session";
import type { Nomination, VotingCategory } from "@/lib/api/types";

export interface ActionResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

const CATEGORY_PATH: Record<VotingCategory, string> = {
  gotm: "gotm_entries",
  nr_gotm: "nr_gotm_entries",
};

// Nomination errors carry a machine code in `error` and the human explanation
// in `message` (e.g. nominations_closed), so prefer `message` — same shape as
// app/actions/votes.ts.
async function errorMessage(response: Response): Promise<string> {
  try {
    const body = await response.json();
    return (
      body.message ?? body.error ?? `Request failed (HTTP ${response.status}).`
    );
  } catch {
    return `Request failed (HTTP ${response.status}).`;
  }
}

// Create or replace the signed-in member's nomination for the round (upsert
// on round + user). The backend enforces the window: nominations are only
// open for the round after the current one, until the current round's vote
// opens.
export async function upsertNominationAction(
  category: VotingCategory,
  round: number,
  gameId: number,
  reason: string,
): Promise<ActionResult<Nomination>> {
  const session = await getSession();
  if (!session) {
    return { ok: false, error: "You must be signed in to nominate." };
  }

  const trimmed = reason.trim();
  // Backend column is varchar(1500).
  if (trimmed.length > 1500) {
    return { ok: false, error: "Reason is too long (max 1500 characters)." };
  }

  const res = await apiFetch(
    `/api/v1/${CATEGORY_PATH[category]}/${round}/nominations`,
    {
      method: "POST",
      body: JSON.stringify({
        data: {
          user_id: session.principal.id,
          gamedb_game_id: gameId,
          reason: trimmed.length > 0 ? trimmed : null,
        },
      }),
    },
  );

  if (!res.ok) return { ok: false, error: await errorMessage(res) };

  const body = (await res.json()) as { data: Nomination };
  revalidatePath("/voting");
  return { ok: true, data: body.data };
}

// Withdraw the signed-in member's nomination for the round (also clears any
// votes already cast on it, server-side).
export async function deleteNominationAction(
  category: VotingCategory,
  round: number,
): Promise<ActionResult<null>> {
  const session = await getSession();
  if (!session) {
    return { ok: false, error: "You must be signed in." };
  }

  const res = await apiFetch(
    `/api/v1/${CATEGORY_PATH[category]}/${round}/nominations/${session.principal.id}`,
    { method: "DELETE" },
  );

  if (!res.ok) return { ok: false, error: await errorMessage(res) };

  revalidatePath("/voting");
  return { ok: true, data: null };
}
