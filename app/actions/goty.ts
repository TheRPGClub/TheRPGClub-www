"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";
import { getSession } from "@/lib/session";
import { gotyError } from "@/lib/goty/copy";
import type { GotyAwardKey, GotyCastResult, GotyEligibility, GotyNomination } from "@/lib/goty/types";

// The signed-in member's GOTY Vote business (spec api#471): Game of the
// Year nominations (no reason), votes on the three Awards, and the
// eligibility check behind the nomination search. The API owns every rule
// (windows, the 3-nomination cap, the vote cap and toggle, eligibility);
// a refusal comes back as the member-facing sentence.

export interface GotyResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

const SIGNED_OUT = { ok: false, error: "You must be signed in." } as const;

async function refused<T>(res: Response, year: number): Promise<GotyResult<T>> {
  const body = await res.json().catch(() => null);
  return { ok: false, error: gotyError(body, res.status, year) };
}

function validYear(year: number): boolean {
  return Number.isInteger(year) && year > 1900 && year < 3000;
}

async function postNomination(year: number, gameId: number): Promise<GotyResult<GotyNomination>> {
  const res = await apiFetch(`/api/v1/goty_votes/${year}/nominations`, {
    method: "POST",
    body: JSON.stringify({ data: { gamedb_game_id: gameId } }),
  });
  if (!res.ok) return refused(res, year);
  return { ok: true, data: ((await res.json()) as { data: GotyNomination }).data };
}

async function deleteNomination(year: number, id: number): Promise<GotyResult<null>> {
  const res = await apiFetch(`/api/v1/goty_votes/${year}/nominations/${id}`, { method: "DELETE" });
  if (!res.ok) return refused(res, year);
  return { ok: true, data: null };
}

export async function nominateGotyAction(year: number, gameId: number): Promise<GotyResult<GotyNomination>> {
  if (!(await getSession())) return SIGNED_OUT;
  if (!validYear(year) || !Number.isInteger(gameId)) return { ok: false, error: "Pick a game." };
  const result = await postNomination(year, gameId);
  if (result.ok) revalidatePath("/goty");
  return result;
}

export async function withdrawGotyAction(year: number, nominationId: number): Promise<GotyResult<null>> {
  if (!(await getSession())) return SIGNED_OUT;
  if (!validYear(year) || !Number.isInteger(nominationId)) return { ok: false, error: "Nothing to withdraw." };
  const result = await deleteNomination(year, nominationId);
  if (result.ok) revalidatePath("/goty");
  return result;
}

// Swap one of the member's nominations for another game. The API has no
// edit (a nomination is only its game), so this withdraws the old one and
// nominates the new; if the new one is refused, the old one goes back.
export async function replaceGotyAction(
  year: number,
  nominationId: number,
  oldGameId: number,
  newGameId: number,
): Promise<GotyResult<GotyNomination>> {
  if (!(await getSession())) return SIGNED_OUT;
  if (!validYear(year) || ![nominationId, oldGameId, newGameId].every(Number.isInteger)) {
    return { ok: false, error: "Pick a game." };
  }
  const removed = await deleteNomination(year, nominationId);
  if (!removed.ok) return { ok: false, error: removed.error };
  const added = await postNomination(year, newGameId);
  if (!added.ok) await postNomination(year, oldGameId);
  revalidatePath("/goty");
  return added;
}

export async function castGotyVoteAction(
  year: number,
  award: GotyAwardKey,
  gameId: number,
): Promise<GotyResult<GotyCastResult>> {
  if (!(await getSession())) return SIGNED_OUT;
  if (!validYear(year) || !Number.isInteger(gameId)) return { ok: false, error: "Pick a game." };
  const res = await apiFetch(`/api/v1/goty_votes/${year}/votes`, {
    method: "POST",
    body: JSON.stringify({ data: { award, gamedb_game_id: gameId } }),
  });
  if (!res.ok) return refused(res, year);
  revalidatePath("/goty");
  return { ok: true, data: ((await res.json()) as { data: GotyCastResult }).data };
}

// Whether each game may be nominated for the year, for greying out search
// results. A failed check is left out, and the search shows the game as
// pickable (the API still refuses an ineligible nomination).
export async function gotyEligibilityAction(
  year: number,
  gameIds: number[],
): Promise<Record<number, GotyEligibility>> {
  if (!(await getSession()) || !validYear(year)) return {};
  const ids = [...new Set(gameIds.filter(Number.isInteger))].slice(0, 12);
  const checks = await Promise.all(
    ids.map(async (id) => {
      try {
        const res = await apiFetch(`/api/v1/games/${id}/goty_eligibility?year=${year}`, { cache: "no-store" });
        if (!res.ok) return null;
        return ((await res.json()) as { data: GotyEligibility }).data;
      } catch {
        return null;
      }
    }),
  );
  return Object.fromEntries(checks.flatMap((c) => (c ? [[c.game_id, c]] : [])));
}
