"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";
import { apiErrorMessage, readApiError } from "@/lib/api/errors";
import { GOTY_AWARDS, type GotyAwardKey, type GotyNominationDeletedResponse, type GotyVote } from "@/lib/api/goty";
import { GOTY_DATE_KEYS, type GotyDateKey } from "@/lib/goty-desk";
import { REMOVAL_REASON_MAX } from "@/lib/rounds";
import { getSession } from "@/lib/session";
import { isAdminOrAbove } from "@/lib/staff";
import { consoleErrorText } from "@/lib/voting-console";

// The GOTY Vote desk's writes (/admin/goty, www#194). Admin and up; the API
// decides every gate and window, and its refusals read in its own words.

export interface GotyDeskResult<T = undefined> {
  ok: boolean;
  data?: T;
  error?: string;
}

const UNREACHABLE = "Couldn't reach the club's server. Try again.";

const validYear = (year: number) => Number.isInteger(year) && year >= 2000 && year <= 9999;

function refresh() {
  revalidatePath("/admin/goty");
  revalidatePath("/goty");
}

async function send(path: string, init: RequestInit): Promise<GotyDeskResult<GotyVote>> {
  let res: Response;
  try {
    res = await apiFetch(path, { cache: "no-store", ...init });
  } catch {
    return { ok: false, error: UNREACHABLE };
  }
  if (!res.ok) return { ok: false, error: consoleErrorText(await readApiError(res)) };
  const body = (await res.json().catch(() => null)) as { data: GotyVote } | null;
  refresh();
  return { ok: true, data: body?.data };
}

// Move the GOTY Vote's dates. Only the ones given move; moving the vote's
// opening alone keeps the default weekend window, so the close follows.
export async function moveGotyDatesAction(
  year: number,
  dates: Partial<Record<GotyDateKey, string>>,
): Promise<GotyDeskResult<GotyVote>> {
  if (!validYear(year)) return { ok: false, error: "That GOTY Vote doesn't exist." };
  const data: Partial<Record<GotyDateKey, string>> = {};
  for (const key of GOTY_DATE_KEYS) {
    const value = dates[key];
    if (value === undefined) continue;
    if (Number.isNaN(Date.parse(value))) return { ok: false, error: "Pick a date and time for each field." };
    data[key] = value;
  }
  if (Object.keys(data).length === 0) return { ok: false, error: "Nothing to save: no date has changed." };
  return send(`/api/v1/goty_votes/${year}`, { method: "PATCH", body: JSON.stringify({ data }) });
}

// Settle an Award a runoff left tied: one winner (an Award has one).
export async function resolveGotyTieAction(
  year: number,
  award: GotyAwardKey,
  gameId: number,
): Promise<GotyDeskResult<GotyVote>> {
  if (!validYear(year) || !GOTY_AWARDS.includes(award)) return { ok: false, error: "That tie doesn't exist." };
  if (!Number.isInteger(gameId) || gameId <= 0) return { ok: false, error: "Pick the winner." };
  return send(`/api/v1/goty_votes/${year}/awards/${award}/resolve_tie`, {
    method: "POST",
    body: JSON.stringify({ data: { gamedb_game_id: gameId } }),
  });
}

const REMOVAL_ERRORS: Record<string, string> = {
  reason_required: "Give a reason: the bot posts it with the change.",
  reason_too_long: `Keep the reason to ${REMOVAL_REASON_MAX} characters.`,
};

export interface GotyRemovalResult {
  ok: boolean;
  // The goty_nomination_deleted job (meta.announce_job_id); null for the
  // viewer's own nomination, which posts nothing.
  jobId?: number | null;
  error?: string;
}

// Remove a Game of the Year nomination, as for a GOTM one: someone else's
// needs a reason (1 to 250), and the API queues the bot's announcement in
// the nomination channel (no DM). The viewer's own needs none.
export async function removeGotyNominationAction(
  year: number,
  nominationId: number,
  userId: string,
  reason: string,
): Promise<GotyRemovalResult> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Sign in again to remove nominations." };
  if (!isAdminOrAbove(session.membership)) {
    return { ok: false, error: "Only Admins and Superadmins can remove nominations." };
  }
  if (!validYear(year) || !Number.isInteger(nominationId)) return { ok: false, error: "That nomination doesn't exist." };

  const own = session.principal.id === userId;
  const trimmed = reason.trim();
  if (!own && !trimmed) return { ok: false, error: REMOVAL_ERRORS.reason_required };
  if (trimmed.length > REMOVAL_REASON_MAX) return { ok: false, error: REMOVAL_ERRORS.reason_too_long };

  const query = own ? "" : `?reason=${encodeURIComponent(trimmed)}`;
  let res: Response;
  try {
    res = await apiFetch(`/api/v1/goty_votes/${year}/nominations/${nominationId}${query}`, { method: "DELETE" });
  } catch {
    return { ok: false, error: UNREACHABLE };
  }
  if (!res.ok) {
    if (res.status === 404) return { ok: false, error: "That nomination is already gone." };
    if (res.status === 403) return { ok: false, error: "Only Admins and Superadmins can remove nominations." };
    return { ok: false, error: apiErrorMessage(await readApiError(res), REMOVAL_ERRORS) };
  }
  refresh();
  const body = (await res.json().catch(() => null)) as GotyNominationDeletedResponse | null;
  return { ok: true, jobId: body?.meta?.announce_job_id ?? null };
}
