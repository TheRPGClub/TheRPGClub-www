"use server";

import { revalidatePath, updateTag } from "next/cache";
import { apiFetch } from "@/lib/api";
import { apiErrorMessage, readApiError } from "@/lib/api/errors";
import type { AdminRoundEntry } from "@/lib/api/admin-rounds";
import type { BotJob, VotingCategory } from "@/lib/api/types";
import { VOTING_CATEGORY_PATH } from "@/lib/api/voting-round";
import { getSession } from "@/lib/session";
import { isAdminOrAbove } from "@/lib/staff";
import { findQueuedJob, normalizeRedditUrl, summaryNamesRound } from "@/lib/rounds";
import { listBotJobsAction } from "@/app/actions/bot-jobs";

type RoundEntry = AdminRoundEntry;

export interface RoundActionResult {
  ok: boolean;
  entries?: RoundEntry[];
  // The gotm_cache_reload job the write queued, when the wire shows it.
  job?: BotJob | null;
  error?: string;
}

const UNREACHABLE = "Couldn't reach the club's server. Try again.";

async function errorMessage(res: Response): Promise<string> {
  if (res.status === 401) return "Sign in again to change rounds.";
  if (res.status === 403) return "Only Admins and Superadmins can change rounds.";
  if (res.status === 404) return "That round entry no longer exists.";
  return apiErrorMessage(await readApiError(res));
}

// The reload job a round write queued, read back off the wire.
async function queuedReload(
  requesterId: string,
  category: VotingCategory,
  round: number,
  since: Date,
): Promise<BotJob | null> {
  const wire = await listBotJobsAction(1);
  if (!wire.ok || !wire.data) return null;
  return findQueuedJob(wire.data, {
    kind: "gotm_cache_reload",
    requesterId,
    since,
    matches: (summary) => summaryNamesRound(summary, category, round),
  });
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

  const since = new Date();
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

  const body = (await res.json()) as { data: RoundEntry[] };
  revalidateRounds();
  const job = await queuedReload(session.principal.id, category, input.roundNumber, since);
  return { ok: true, entries: body.data, job };
}

export interface RoundEntryEdit {
  id: number;
  gamedb_game_id?: number;
  // A string to set (blank clears it); absent to leave it.
  reddit_url?: string;
}

// Save the changed slots of one round, one PATCH each (the API has no
// round-level edit). Each staff PATCH queues a cache reload; the result
// carries the newest. Stops at the first refusal, keeping what was saved.
export async function updateRoundEntriesAction(
  category: VotingCategory,
  round: number,
  edits: RoundEntryEdit[],
): Promise<RoundActionResult> {
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

  const since = new Date();
  const saved: RoundEntry[] = [];
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
    saved.push(((await res.json()) as { data: RoundEntry }).data);
  }

  if (saved.length > 0) revalidateRounds();
  const job = saved.length > 0 ? await queuedReload(session.principal.id, category, round, since) : null;
  if (failure) {
    const kept = saved.length > 0 ? ` ${saved.length} of ${edits.length} changes were saved.` : "";
    return { ok: false, entries: saved, job, error: `${failure}${kept}` };
  }
  return { ok: true, entries: saved, job };
}
