import { apiFetch } from "@/lib/api";
import type {
  AchievementProviderTotals,
  ApiCollection,
  ApiSingle,
  GameCollection,
  GameCompletion,
  LinkedAccount,
  Platform,
  SocialPlatform,
  User,
  UserBacklog,
  UserFavorite,
  UserNowPlaying,
} from "@/lib/api/types";
import { NO_ROWS, paginationOf, type ListPage } from "@/lib/api/pagination";
import type { FeatureView } from "@/lib/features";
import { fetchAchievementSummary } from "@/lib/member-achievements-server";

// The profile edit page's reads. The page gates and fills its view; this
// fetches the profile, the reference data and every list it edits.

const EDITOR_LIMIT = 50;

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

// Lists belong to Features; the editor leaves out (and doesn't read) the ones
// this member isn't shown. Favorites belong to no Feature. Linked Accounts
// follow the flag only, like the Achievements pages whose "link an account"
// button lands here.
export function memberEditShown(features: FeatureView) {
  return {
    now_playing: features.shown("now_playing"),
    completed: features.shown("game_completions"),
    backlog: features.shown("backlog"),
    collection: features.shown("collection"),
    linked: features.canOpen("achievement_hub"),
  };
}
export type MemberEditShown = ReturnType<typeof memberEditShown>;

const list = <T>(shown: boolean, path: string) =>
  shown ? loadCollection<T>(`${path}?per=${EDITOR_LIMIT}`) : NO_ROWS;

/**
 * Everything the edit page shows, or null when the member can't be read.
 * Each request is independent, so they go out in parallel.
 */
export async function fetchMemberEdit(id: string, shown: MemberEditShown) {
  const base = `/api/v1/users/${id}`;
  const [userRes, socialPlatforms, platforms, favorites, nowPlaying, completed, backlog, collection, linkedAccounts, providerTotals] =
    await Promise.all([
      apiFetch(base, { cache: "no-store" }),
      loadCollection<SocialPlatform>("/api/v1/social_platforms"),
      loadCollection<Platform>("/api/v1/platforms?per=100"),
      list<UserFavorite>(true, `${base}/favorites`),
      list<UserNowPlaying>(shown.now_playing, `${base}/now_playing`),
      list<GameCompletion>(shown.completed, `${base}/completions`),
      list<UserBacklog>(shown.backlog, `${base}/backlog`),
      list<GameCollection>(shown.collection, `${base}/collections`),
      shown.linked ? loadLinkedAccounts(id) : null,
      shown.linked ? loadProviderTotals(id) : null,
    ]);
  if (!userRes.ok) return null;
  const { data: user }: ApiSingle<User> = await userRes.json();
  return {
    user,
    socialPlatforms: socialPlatforms.data,
    platforms: platforms.data,
    lists: { favorites, nowPlaying, completed, backlog, collection },
    linkedAccounts,
    providerTotals,
  };
}
export type MemberEditData = NonNullable<Awaited<ReturnType<typeof fetchMemberEdit>>>;

// The lists the edit page offers, in its order. `list` names the read in
// `MemberEditData.lists`; `shown` the switch in `MemberEditShown` (null: always).
export const EDIT_LISTS = [
  {
    id: "now-playing",
    kind: "now_playing",
    title: "Now playing",
    description: "Games you're actively playing.",
    list: "nowPlaying",
    shown: "now_playing",
  },
  {
    id: "favorites",
    kind: "favorite",
    title: "Favorites",
    description: "Your all-time picks.",
    list: "favorites",
    shown: null,
  },
  {
    id: "completed",
    kind: "completed",
    title: "Completed",
    description: "Games you've finished.",
    list: "completed",
    shown: "completed",
  },
  {
    id: "backlog",
    kind: "backlog",
    title: "Backlog",
    description: "Games you'd like to play.",
    list: "backlog",
    shown: "backlog",
  },
  {
    id: "collection",
    kind: "collection",
    title: "Collection",
    description: "Games you own.",
    list: "collection",
    shown: "collection",
  },
] as const;
