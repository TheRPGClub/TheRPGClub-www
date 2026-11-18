import { apiFetch } from "@/lib/api";
import type { BirthDate } from "@/lib/birth-date";

// A member's Birth Date document, read fresh: the changes left this month
// move with every save. Null when the read failed. The API answers only the
// member and staff.
export async function fetchBirthDate(userId: string): Promise<BirthDate | null> {
  try {
    const res = await apiFetch(`/api/v1/users/${encodeURIComponent(userId)}/birth_date`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { data?: BirthDate };
    return body.data ?? null;
  } catch {
    return null;
  }
}
