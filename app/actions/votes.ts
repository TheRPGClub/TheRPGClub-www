"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";
import { getSession } from "@/lib/session";
import type { CastVoteResult, VotingCategory } from "@/lib/api/types";

export interface ActionResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

const CATEGORY_PATH: Record<VotingCategory, string> = {
  gotm: "gotm_entries",
  nr_gotm: "nr_gotm_entries",
};

// Vote errors carry a machine code in `error` and the human explanation in
// `message` (e.g. voting_closed / "voting for round 84 closed at ..."), so
// prefer `message` — the opposite of app/actions/reviews.ts.
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

// Cast or toggle the signed-in member's vote on a nomination. The backend
// owns the rules (voting window, per-user cap with oldest-vote eviction,
// vote-again-to-unvote); the result's `action`/`warning` report what
// happened so the UI can tell the voter.
export async function castVoteAction(
  category: VotingCategory,
  round: number,
  nominationId: number,
): Promise<ActionResult<CastVoteResult>> {
  const session = await getSession();
  if (!session) return { ok: false, error: "You must be signed in to vote." };

  const res = await apiFetch(
    `/api/v1/${CATEGORY_PATH[category]}/${round}/votes`,
    {
      method: "POST",
      body: JSON.stringify({
        data: {
          user_id: session.principal.id,
          nomination_id: nominationId,
        },
      }),
    },
  );

  if (!res.ok) return { ok: false, error: await errorMessage(res) };

  const body = (await res.json()) as { data: CastVoteResult };
  revalidatePath("/voting");
  return { ok: true, data: body.data };
}
