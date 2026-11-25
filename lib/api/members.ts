import { memberName } from "@/lib/achievements";
import { fetchMembers } from "@/lib/api/shared";

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
  const data = await fetchMembers(qs.toString(), MEMBERS_REVALIDATE_SECONDS);
  return new Map((data ?? []).map((user) => [user.user_id, memberName(user)]));
}
