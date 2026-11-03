"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";
import { apiErrorMessage, readApiError } from "@/lib/api/errors";
import { getSession } from "@/lib/session";
import type { Nomination, NominationDeletedResponse, VotingCategory } from "@/lib/api/types";
import { REMOVAL_REASON_MAX } from "@/lib/rounds";
import { isAdminOrAbove } from "@/lib/staff";

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

export interface StaffNominationDeleteResult {
  ok: boolean;
  // The nomination_deleted job the API queued (meta.announce_job_id).
  // Null for the viewer's own nomination, which posts no announcement.
  jobId?: number | null;
  error?: string;
}

const REMOVAL_ERRORS: Record<string, string> = {
  reason_required: "Give a reason: the bot posts it with the change.",
  reason_too_long: `Keep the reason to ${REMOVAL_REASON_MAX} characters.`,
};

// An Admin deletes any member's nomination for the round, with a reason.
// Someone else's needs the reason, and the API queues the bot's
// announcement (the change and the refreshed list in the nomination
// channel; no DM). The viewer's own needs none and posts nothing.
export async function staffDeleteNominationAction(
  category: VotingCategory,
  round: number,
  userId: string,
  reason: string,
): Promise<StaffNominationDeleteResult> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Sign in again to delete nominations." };
  if (!isAdminOrAbove(session.membership)) {
    return { ok: false, error: "Only Admins and Superadmins can delete nominations." };
  }

  const own = session.principal.id === userId;
  const trimmed = reason.trim();
  if (!own && !trimmed) return { ok: false, error: REMOVAL_ERRORS.reason_required };
  if (trimmed.length > REMOVAL_REASON_MAX) return { ok: false, error: REMOVAL_ERRORS.reason_too_long };

  const query = !own ? `?reason=${encodeURIComponent(trimmed)}` : "";
  let res: Response;
  try {
    res = await apiFetch(
      `/api/v1/${CATEGORY_PATH[category]}/${round}/nominations/${encodeURIComponent(userId)}${query}`,
      { method: "DELETE" },
    );
  } catch {
    return { ok: false, error: "Couldn't reach the club's server. Try again." };
  }
  if (!res.ok) {
    if (res.status === 404) return { ok: false, error: "That nomination is already gone." };
    if (res.status === 403) return { ok: false, error: "Only Admins and Superadmins can delete nominations." };
    return { ok: false, error: apiErrorMessage(await readApiError(res), REMOVAL_ERRORS) };
  }

  revalidatePath("/voting");
  revalidatePath("/admin/nominations");
  if (own) return { ok: true, jobId: null };
  const body = (await res.json().catch(() => null)) as NominationDeletedResponse | null;
  return { ok: true, jobId: body?.meta?.announce_job_id ?? null };
}
