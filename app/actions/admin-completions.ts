"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";
import type { ApiCollection, CompletionCreateMeta, GameCompletion } from "@/lib/api/types";
import { COMPLETION_NOTE_MAX } from "@/lib/completions";
import { COMPLETION_TYPES } from "@/lib/imports/completionator";
import { getSession } from "@/lib/session";
import { isSuperadmin } from "@/lib/staff";

export interface LogCompletionInput {
  userId: string;
  gameId: number;
  completionType: string;
  platformId: number | null;
  // YYYY-MM-DD, or "" for no date.
  completedOn: string;
  playtimeHours: number | null;
  note: string;
  announce: boolean;
}

export interface LogCompletionResult {
  ok: boolean;
  error?: string;
  completionId?: number;
  // The completion_announce job (meta.announce_job_id), when announced.
  jobId?: number | null;
}

async function errorMessage(res: Response): Promise<string> {
  if (res.status === 401) return "Sign in again to log a completion.";
  if (res.status === 403) return "Only Superadmins can log a Game Completion for another member.";
  if (res.status === 404) return "That member isn't in the club's member list.";
  try {
    const body = await res.json();
    return body.error ?? body.message ?? `Couldn't log it (HTTP ${res.status}).`;
  } catch {
    return `Couldn't log it (HTTP ${res.status}).`;
  }
}

// A Superadmin logs a Game Completion for another member, optionally queuing
// the bot's announcement (completion_announce). The API also drops the game
// from that member's Now Playing. The announcement's job id comes back as
// meta.announce_job_id.
export async function logCompletionForMemberAction(
  input: LogCompletionInput,
): Promise<LogCompletionResult> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Sign in again to log a completion." };
  if (!isSuperadmin(session.membership)) {
    return { ok: false, error: "Only Superadmins can log a Game Completion for another member." };
  }
  if (!/^\d+$/.test(input.userId)) return { ok: false, error: "Pick a member first." };
  if (!Number.isInteger(input.gameId) || input.gameId <= 0) {
    return { ok: false, error: "Pick a game first." };
  }
  if (!(COMPLETION_TYPES as readonly string[]).includes(input.completionType)) {
    return { ok: false, error: "Pick a completion type." };
  }
  if (input.completedOn && !/^\d{4}-\d{2}-\d{2}$/.test(input.completedOn)) {
    return { ok: false, error: "The completion date isn't a date." };
  }
  if (input.playtimeHours !== null && !(Number.isFinite(input.playtimeHours) && input.playtimeHours >= 0)) {
    return { ok: false, error: "Final playtime must be a non-negative number of hours." };
  }
  const note = input.note.trim();
  if (note.length > COMPLETION_NOTE_MAX) {
    return { ok: false, error: `The note must be ${COMPLETION_NOTE_MAX} characters or fewer.` };
  }

  let res: Response;
  try {
    res = await apiFetch(`/api/v1/users/${input.userId}/completions`, {
      method: "POST",
      body: JSON.stringify({
        data: {
          gamedb_game_id: input.gameId,
          completion_type: input.completionType,
          platform_id: input.platformId,
          completed_at: input.completedOn || null,
          final_playtime_hrs: input.playtimeHours,
          note: note || null,
          announce: input.announce,
        },
      }),
    });
  } catch {
    return { ok: false, error: "Couldn't reach the club's server. Try again." };
  }
  if (!res.ok) return { ok: false, error: await errorMessage(res) };

  const body = (await res.json()) as {
    data: GameCompletion;
    meta?: CompletionCreateMeta;
  };
  revalidatePath(`/members/${input.userId}`);
  revalidatePath(`/members/${input.userId}/completed-games`);
  revalidatePath(`/members/${input.userId}/now-playing-games`);
  revalidatePath("/admin");

  return {
    ok: true,
    completionId: body.data.completion_id,
    jobId: input.announce ? (body.meta?.announce_job_id ?? null) : null,
  };
}

// How many completions a member has logged for a year, for the proof's
// "Game completion #N" line. Null when it can't be read.
export async function memberYearCompletionCountAction(
  userId: string,
  year: number,
): Promise<number | null> {
  if (!/^\d+$/.test(userId) || !Number.isInteger(year)) return null;
  try {
    const res = await apiFetch(`/api/v1/users/${userId}/completions?year=${year}&per=1`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const body = (await res.json()) as ApiCollection<GameCompletion>;
    return body.meta?.count ?? null;
  } catch {
    return null;
  }
}
