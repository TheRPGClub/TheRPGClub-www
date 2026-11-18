"use server";

import { apiFetch } from "@/lib/api";
import { birthDateRefusal } from "@/lib/birth-date";
import type { StaffBirthDate } from "@/lib/staff-birth-date";
import { getSession } from "@/lib/session";
import { isModeratorOrAbove } from "@/lib/staff";

// The staff Birth Dates desk (www#118): read a member's Birth Date, set or
// remove it (with or without the year), and stop them sharing their
// Birthday. Staff never turn sharing on: no action here sends `true`.

const NOT_STAFF = "Only staff can set another member's Birth Date.";
const UNREACHABLE = "Couldn't reach the club's server. Nothing was saved; try again.";

export type MemberBirthDateResult = { ok: true; data: StaffBirthDate } | { ok: false; error: string };

type Change = { birth_date: string | null } | { birthday_shared: false };

async function staffCheck(userId: string): Promise<string | null> {
  const session = await getSession();
  if (!session) return "Sign in again to change a Birth Date.";
  if (!isModeratorOrAbove(session.membership)) return NOT_STAFF;
  if (!/^\d+$/.test(userId)) return "Pick a member first.";
  return null;
}

async function readJson(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

async function put(userId: string, change: Change): Promise<MemberBirthDateResult> {
  const refused = await staffCheck(userId);
  if (refused) return { ok: false, error: refused };

  let res: Response;
  try {
    res = await apiFetch(`/api/v1/users/${encodeURIComponent(userId)}/birth_date`, {
      method: "PUT",
      body: JSON.stringify({ data: change }),
    });
  } catch {
    return { ok: false, error: UNREACHABLE };
  }
  if (!res.ok) return { ok: false, error: birthDateRefusal(res.status, await readJson(res)).error };
  const body = (await res.json()) as { data: StaffBirthDate };
  return { ok: true, data: body.data };
}

// Staff read a member's Birth Date on the desk once they pick the member.
export async function readMemberBirthDateAction(userId: string): Promise<MemberBirthDateResult> {
  const refused = await staffCheck(userId);
  if (refused) return { ok: false, error: refused };

  let res: Response;
  try {
    res = await apiFetch(`/api/v1/users/${encodeURIComponent(userId)}/birth_date`, { cache: "no-store" });
  } catch {
    return { ok: false, error: "Couldn't reach the club's server. Pick the member again to retry." };
  }
  if (res.status === 403) return { ok: false, error: NOT_STAFF };
  if (!res.ok) return { ok: false, error: `Couldn't read their Birth Date (HTTP ${res.status}).` };
  const body = (await res.json()) as { data: StaffBirthDate };
  return { ok: true, data: body.data };
}

// Set ("1990-05-04" or "05-04", from `birthDateValue`) or remove (null) a
// member's Birth Date. Removing it also stops sharing their Birthday.
export async function saveMemberBirthDateAction(input: {
  userId: string;
  birthDate: string | null;
}): Promise<MemberBirthDateResult> {
  if (input.birthDate !== null && !/^(\d{4}-)?\d{2}-\d{2}$/.test(input.birthDate)) {
    return { ok: false, error: "Pick the day and the month. The year is optional." };
  }
  return put(input.userId, { birth_date: input.birthDate });
}

// Stop a member sharing their Birthday. Only the member can turn it back on.
export async function stopMemberBirthdaySharingAction(userId: string): Promise<MemberBirthDateResult> {
  return put(userId, { birthday_shared: false });
}
