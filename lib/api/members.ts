import { apiFetch } from "@/lib/api";
import { memberName } from "@/lib/achievements";
import type { ApiCollection, UserSummary } from "@/lib/api/types";

// How long the member directory (`/users`) is cached. Pages that list members
// share it, and the "members" tag lets an update refresh them together.
export const MEMBERS_REVALIDATE_SECONDS = 300;

// The API's page size cap.
const MAX_PER = 500;

// user_id -> display name (`memberName()`), server only. With no ids, the
// whole cached member directory; with ids, one cached `discord_id` read for
// just those (e.g. the reviewing Superadmins). Empty when it can't be read,
// and an id the API doesn't know is left out: callers fall back to their own
// wording ("a member").
export async function fetchMemberNames(
  ids?: readonly (string | null | undefined)[],
): Promise<Map<string, string>> {
  const qs = new URLSearchParams({ per: String(MAX_PER) });
  if (ids) {
    const unique = [...new Set(ids.filter((id): id is string => !!id))].sort();
    if (unique.length === 0) return new Map();
    qs.set("discord_id", unique.join(","));
  }
  try {
    const res = await apiFetch(`/api/v1/users?${qs}`, {
      next: { revalidate: MEMBERS_REVALIDATE_SECONDS, tags: ["members"] },
    });
    if (!res.ok) return new Map();
    const { data }: ApiCollection<UserSummary> = await res.json();
    return new Map(data.map((user) => [user.user_id, memberName(user)]));
  } catch {
    return new Map();
  }
}
