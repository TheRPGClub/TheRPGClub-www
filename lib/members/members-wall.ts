import { MEMBERS_REVALIDATE_SECONDS } from "@/lib/api/members";
import type { User } from "@/lib/api/types";
import { fetchMembers } from "@/lib/api/shared";
import { wallTiers, type Tier } from "@/lib/members/member-tiers";

// The members page's read (server only): the tiers from the members list.

const FETCH_LIMIT = 500;

// The page's tiers, or null when the API can't be read.
export async function fetchWallTiers(): Promise<Tier[] | null> {
  try {
    const all = await fetchMembers<User>(`per=${FETCH_LIMIT}`, MEMBERS_REVALIDATE_SECONDS);
    return all ? wallTiers(all) : null;
  } catch {
    return null;
  }
}
