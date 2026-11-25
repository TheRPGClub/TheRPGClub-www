"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";
import { getSession } from "@/lib/session";
import { fetchGotyEligibilities } from "@/lib/api/goty";
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

// A failed Swap also says what became of the nomination it was replacing:
// put back (a new nomination, with a new id) or lost.
export interface GotySwapResult extends GotyResult<GotyNomination> {
  restored?: GotyNomination | null;
}

const SIGNED_OUT = { ok: false, error: "You must be signed in." } as const;
const UNREACHABLE = "Couldn't reach the club's server. Try again.";

async function refused<T>(res: Response, year: number): Promise<GotyResult<T>> {
  const body = await res.json().catch(() => null);
  return { ok: false, error: gotyError(body, res.status, year) };
}

function validYear(year: number): boolean {
  return Number.isInteger(year) && year > 1900 && year < 3000;
}

// One write to the API: its refusal in the member's words, and an
// unreachable API (or an unreadable answer) as a plain failure rather than
// a throw into the error boundary.
async function send<T>(year: number, path: string, init: RequestInit, read: (res: Response) => Promise<T>): Promise<GotyResult<T>> {
  try {
    const res = await apiFetch(path, init);
    if (!res.ok) return refused(res, year);
    return { ok: true, data: await read(res) };
  } catch {
    return { ok: false, error: UNREACHABLE };
  }
}

const dataOf = async <T,>(res: Response) => ((await res.json()) as { data: T }).data;

function postNomination(year: number, gameId: number): Promise<GotyResult<GotyNomination>> {
  return send(
    year,
    `/api/v1/goty_votes/${year}/nominations`,
    { method: "POST", body: JSON.stringify({ data: { gamedb_game_id: gameId } }) },
    dataOf<GotyNomination>,
  );
}

function deleteNomination(year: number, id: number): Promise<GotyResult<null>> {
  return send(year, `/api/v1/goty_votes/${year}/nominations/${id}`, { method: "DELETE" }, async () => null);
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
// nominates the new; if the new one is refused, the old one goes back (as a
// new nomination, returned in `restored`), and if even that fails the
// member is told the old one is gone.
export async function replaceGotyAction(
  year: number,
  nominationId: number,
  oldGameId: number,
  newGameId: number,
): Promise<GotySwapResult> {
  if (!(await getSession())) return SIGNED_OUT;
  if (!validYear(year) || ![nominationId, oldGameId, newGameId].every(Number.isInteger)) {
    return { ok: false, error: "Pick a game." };
  }
  const removed = await deleteNomination(year, nominationId);
  if (!removed.ok) return { ok: false, error: removed.error };
  const added = await postNomination(year, newGameId);
  revalidatePath("/goty");
  if (added.ok) return added;
  const restore = await postNomination(year, oldGameId);
  if (restore.ok) return { ok: false, error: added.error, restored: restore.data ?? null };
  return {
    ok: false,
    restored: null,
    error: `${added.error ?? "The new game was refused."} Your old nomination was withdrawn and couldn't be put back, so nominate it again if you still want it.`,
  };
}

export async function castGotyVoteAction(
  year: number,
  award: GotyAwardKey,
  gameId: number,
): Promise<GotyResult<GotyCastResult>> {
  if (!(await getSession())) return SIGNED_OUT;
  if (!validYear(year) || !Number.isInteger(gameId)) return { ok: false, error: "Pick a game." };
  const result = await send(
    year,
    `/api/v1/goty_votes/${year}/votes`,
    { method: "POST", body: JSON.stringify({ data: { award, gamedb_game_id: gameId } }) },
    dataOf<GotyCastResult>,
  );
  if (result.ok) revalidatePath("/goty");
  return result;
}

// Whether each game may be nominated for the year, for greying out search
// results, in one request per result set. A game the API didn't answer for
// (or a failed check) is left out, and the search shows it as pickable (the
// API still refuses an ineligible nomination).
export async function gotyEligibilityAction(
  year: number,
  gameIds: number[],
): Promise<Record<number, GotyEligibility>> {
  if (!(await getSession()) || !validYear(year)) return {};
  return fetchGotyEligibilities(year, gameIds);
}
