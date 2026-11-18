"use server";

import { refresh, updateTag } from "next/cache";
import { apiFetch } from "@/lib/api";
import { BIRTHDAYS_TAG } from "@/lib/api/birthdays";
import { birthDateRefusal, birthDateRequest, type BirthDate } from "@/lib/birth-date";
import { clubToday } from "@/lib/challenges/dates";
import { getSession } from "@/lib/session";

const UNREACHABLE = "Couldn't reach the club's server. Nothing was saved; try again.";

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

// Set or remove (`birthDate: null`) the signed-in member's own Birth Date,
// under the two-a-month limit, which the API decides. Staff set another
// member's from the desk (app/actions/member-birth-date.ts).
export async function saveBirthDateAction(input: { birthDate: string | null }): Promise<BirthDateResult> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Sign in again to change a Birth Date." };
  const userId = session.principal.discord_id;

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
  // A member's own date shows on their /settings: refresh their router so
  // the page re-reads it. A changed or removed date also moves (or drops) a
  // shared Birthday in everyone's Upcoming Birthdays.
  updateTag(BIRTHDAYS_TAG);
  refresh();
  return { ok: true, data: body.data };
}

// Share the signed-in member's Birthday (the day and month of their Birth
// Date) or stop sharing it. Only the member can turn it on, and only with a
// Birth Date: the API refuses sharing without one in its own words. Switching
// never counts toward the twice-a-month limit.
export async function shareBirthdayAction(shared: boolean): Promise<BirthDateResult> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Sign in again to share your Birthday." };
  const userId = session.principal.discord_id;

  let res: Response;
  try {
    res = await apiFetch(`/api/v1/users/${encodeURIComponent(userId)}/birth_date`, {
      method: "PUT",
      body: JSON.stringify({ data: { birthday_shared: shared } }),
    });
  } catch {
    return { ok: false, error: UNREACHABLE };
  }
  if (res.status === 403) return { ok: false, error: "Only you can share your Birthday." };
  if (!res.ok) return { ok: false, error: birthDateRefusal(res.status, await readJson(res)).error };
  const body = (await res.json()) as { data: BirthDate };
  updateTag(BIRTHDAYS_TAG);
  refresh();
  return { ok: true, data: body.data };
}
