"use server";

import { revalidatePath, updateTag } from "next/cache";
import { apiFetch } from "@/lib/api";
import { apiErrorMessage, readApiError } from "@/lib/api/errors";
import { fetchRoundEntries, type AdminRoundEntry } from "@/lib/api/admin-rounds";
import type { GotmReloadMeta, VotingCategory } from "@/lib/api/types";
import { VOTING_CATEGORY_PATH } from "@/lib/api/voting-round";
import { getSession } from "@/lib/session";
import { isAdminOrAbove } from "@/lib/staff";
import { normalizeRedditUrl } from "@/lib/rounds";

type RoundEntry = AdminRoundEntry;

export interface RoundActionResult {
  ok: boolean;
  entries?: RoundEntry[];
  // The gotm_cache_reload job the (last successful) write queued, from
  // meta.reload_job_id.
  jobId?: number | null;
  error?: string;
}

export interface RoundEditResult extends RoundActionResult {
  // The entry ids that were saved, in the order they were sent.
  savedIds?: number[];
  // The whole round re-read after a refusal, so the editor shows what the
  // server now holds. Null when that read failed too.
  round?: RoundEntry[] | null;
}

const UNREACHABLE = "Couldn't reach the club's server. Try again.";

async function errorMessage(res: Response): Promise<string> {
  if (res.status === 401) return "Sign in again to change rounds.";
  if (res.status === 403) return "Only Admins and Superadmins can change rounds.";
  if (res.status === 404) return "That round entry no longer exists.";
  return apiErrorMessage(await readApiError(res));
}

function revalidateRounds() {
  updateTag("gotm");
  revalidatePath("/admin/rounds", "layout");
  revalidatePath("/gotm");
}

// Add a whole GOTM or NR-GOTM round in one go: its number, month and games
// in slot order. The API refuses the lot (nothing saved) on any bad game or
// a round that already exists, and queues the bot's cache reload.
export async function createRoundAction(
  category: VotingCategory,
  input: { roundNumber: number; monthYear: string; gameIds: number[] },
): Promise<RoundActionResult> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Sign in again to add a round." };
  if (!isAdminOrAbove(session.membership)) {
    return { ok: false, error: "Only Admins and Superadmins can add rounds." };
  }

  const monthYear = input.monthYear.trim();
  if (!Number.isInteger(input.roundNumber) || input.roundNumber < 1) {
    return { ok: false, error: "The round number must be a whole number above 0." };
  }
  if (!monthYear) return { ok: false, error: "Give the round its month, e.g. December 2026." };
  if (input.gameIds.length === 0) return { ok: false, error: "Add at least one game." };

  let res: Response;
  try {
    res = await apiFetch(`/api/v1/${VOTING_CATEGORY_PATH[category]}/rounds`, {
      method: "POST",
      body: JSON.stringify({
        data: {
          round_number: input.roundNumber,
          month_year: monthYear,
          games: input.gameIds.map((id) => ({ gamedb_game_id: id })),
        },
      }),
    });
  } catch {
    return { ok: false, error: UNREACHABLE };
  }
  if (!res.ok) return { ok: false, error: await errorMessage(res) };

  const body = (await res.json()) as { data: RoundEntry[]; meta?: GotmReloadMeta };
  revalidateRounds();
  return { ok: true, entries: body.data, jobId: body.meta?.reload_job_id ?? null };
}

export interface RoundEntryEdit {
  id: number;
  gamedb_game_id?: number;
  // A string to set (blank clears it); absent to leave it.
  reddit_url?: string;
}

// Save the changed slots of one round, one PATCH each (the API has no
// round-level edit). The editor checks the final round has no game twice
// before sending, so a swap goes out as two PATCHes. Each staff PATCH
// queues a cache reload; the result carries the last one. Stops at the
// first refusal, then re-reads the round so the editor shows what saved.
export async function updateRoundEntriesAction(
  category: VotingCategory,
  round: number,
  edits: RoundEntryEdit[],
): Promise<RoundEditResult> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Sign in again to edit the round." };
  if (!isAdminOrAbove(session.membership)) {
    return { ok: false, error: "Only Admins and Superadmins can edit rounds." };
  }
  if (edits.length === 0) return { ok: false, error: "Nothing has changed." };

  const bodies: Record<string, unknown>[] = [];
  for (const edit of edits) {
    const data: Record<string, unknown> = {};
    if (edit.gamedb_game_id !== undefined) data.gamedb_game_id = edit.gamedb_game_id;
    if (edit.reddit_url !== undefined) {
      const { url, error } = normalizeRedditUrl(edit.reddit_url);
      if (error) return { ok: false, error };
      data.reddit_url = url;
    }
    bodies.push(data);
  }

  const saved: RoundEntry[] = [];
  let jobId: number | null = null;
  let failure: string | null = null;
  for (const [i, edit] of edits.entries()) {
    let res: Response;
    try {
      res = await apiFetch(`/api/v1/${VOTING_CATEGORY_PATH[category]}/${edit.id}`, {
        method: "PATCH",
        body: JSON.stringify({ data: bodies[i] }),
      });
    } catch {
      failure = UNREACHABLE;
      break;
    }
    if (!res.ok) {
      failure = await errorMessage(res);
      break;
    }
    const body = (await res.json()) as { data: RoundEntry; meta?: GotmReloadMeta };
    saved.push(body.data);
    jobId = body.meta?.reload_job_id ?? jobId;
  }

  if (saved.length > 0) revalidateRounds();
  const savedIds = edits.slice(0, saved.length).map((e) => e.id);
  if (failure) {
    const fresh = await fetchRoundEntries(category, round);
    return { ok: false, entries: saved, savedIds, jobId, round: fresh, error: failure };
  }
  return { ok: true, entries: saved, savedIds, jobId };
}
