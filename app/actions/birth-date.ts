"use server";

import { refresh } from "next/cache";
import { apiFetch } from "@/lib/api";
import { birthDateRefusal, birthDateRequest, type BirthDate } from "@/lib/birth-date";
import { clubToday } from "@/lib/challenges/dates";
import { getSession } from "@/lib/session";
import { isModeratorOrAbove } from "@/lib/staff";

const UNREACHABLE = "Couldn't reach the club's server. Nothing was saved; try again.";
const NOT_STAFF = "Only staff can set another member's Birth Date.";

export type BirthDateResult =
  | { ok: true; data: BirthDate }
  | { ok: false; error: string; nextChangeOn?: string | null };

async function readJson(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

// Set or remove (`birthDate: null`) a Birth Date. Without `userId` it is the
// signed-in member's own, under the two-a-month limit; with one it is staff
// setting another member's, which the API never counts. The API decides
// both; the staff check here only words the refusal before the round trip.
export async function saveBirthDateAction(input: {
  userId?: string;
  birthDate: string | null;
}): Promise<BirthDateResult> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Sign in again to change a Birth Date." };
  const own = session.principal.discord_id;
  const userId = input.userId ?? own;
  if (!/^\d+$/.test(userId)) return { ok: false, error: "Pick a member first." };
  if (userId !== own && !isModeratorOrAbove(session.membership)) return { ok: false, error: NOT_STAFF };

  const request = birthDateRequest(input.birthDate, clubToday());
  if (!request.ok) return { ok: false, error: request.error };

  let res: Response;
  try {
    res = await apiFetch(`/api/v1/users/${encodeURIComponent(userId)}/birth_date`, {
      method: "PUT",
      body: JSON.stringify(request.body),
    });
  } catch {
    return { ok: false, error: UNREACHABLE };
  }
  if (!res.ok) return { ok: false, ...birthDateRefusal(res.status, await readJson(res)) };
  const body = (await res.json()) as { data: BirthDate };
  // A member's own date shows only on their /settings: refresh their router
  // so the page re-reads it. Staff read the member's afresh on each pick.
  if (userId === own) refresh();
  return { ok: true, data: body.data };
}
