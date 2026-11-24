import { apiFetch } from "@/lib/api";
import type {
  AchievementProviderTotals,
  ApiCollection,
  ApiSingle,
  LinkedAccount,
  SocialPlatform,
  User,
} from "@/lib/api/types";
import { NO_ROWS, paginationOf, type ListPage } from "@/lib/api/pagination";
import { fetchAchievementSummary } from "@/lib/member-achievements-server";

// The profile edit page's reads. The page gates and fills its view; this
// fetches the profile, the social platforms and the Linked Accounts. The
// member's lists are managed on their own pages (spec api#451), so the edit
// page only links to them.

async function loadCollection<T>(path: string): Promise<ListPage<T>> {
  try {
    const res = await apiFetch(path, { cache: "no-store" });
    if (!res.ok) return NO_ROWS;
    const body: ApiCollection<T> = await res.json();
    return { data: body.data, total: paginationOf(body.meta, body.data.length).total };
  } catch {
    return NO_ROWS;
  }
}

// The member's Linked Accounts (`{ data: [...] }`, no meta). Null when the
// list can't be read, so the editor says so instead of offering to link
// accounts the member may already have.
async function loadLinkedAccounts(userId: string): Promise<LinkedAccount[] | null> {
  try {
    const res = await apiFetch(`/api/v1/users/${userId}/linked_accounts`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const body: { data: LinkedAccount[] } = await res.json();
    return body.data;
  } catch {
    return null;
  }
}

// Unlocks per Provider, for the unlink warning. The summary is 404 for a
// member with no Linked Account, which means no Unlocks anywhere.
async function loadProviderTotals(
  userId: string,
): Promise<AchievementProviderTotals[] | null> {
  const result = await fetchAchievementSummary(userId);
  if (result.status === "ok") return result.summary.providers;
  return result.status === "none" ? [] : null;
}

/**
 * Everything the edit page shows, or null when the member can't be read.
 * Linked Accounts follow the hub's flag only, like the Achievements pages
 * whose "link an account" button lands here. Reads go out in parallel.
 */
export async function fetchMemberEdit(id: string, linked: boolean) {
  const [userRes, socialPlatforms, linkedAccounts, providerTotals] = await Promise.all([
    apiFetch(`/api/v1/users/${id}`, { cache: "no-store" }),
    loadCollection<SocialPlatform>("/api/v1/social_platforms"),
    linked ? loadLinkedAccounts(id) : null,
    linked ? loadProviderTotals(id) : null,
  ]);
  if (!userRes.ok) return null;
  const { data: user }: ApiSingle<User> = await userRes.json();
  return { user, socialPlatforms: socialPlatforms.data, linkedAccounts, providerTotals };
}
export type MemberEditData = NonNullable<Awaited<ReturnType<typeof fetchMemberEdit>>>;
