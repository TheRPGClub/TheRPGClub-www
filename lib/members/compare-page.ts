import { apiFetch } from "@/lib/api";
import type {
  ApiCollection,
  CommonCompletion,
  CommonCompletionMeta,
  GameCompletion,
  Platform,
  User,
} from "@/lib/api/types";
import { MEMBERS_REVALIDATE_SECONDS } from "@/lib/api/members";
import { paginationOf } from "@/lib/api/pagination";
import { commonCompletionsQuery, type CompareFilters } from "@/lib/completions-compare";
import { fetchAllCompletions } from "@/lib/members/completions";
import { fetchMember } from "@/lib/members/member-page";

// Compare completions: the overlap diagram ("only A / both / only B") over a
// contact sheet of the shared games.
//
// The API's `completions/common` gives the shared games (filtered, paged)
// but nothing about the games only one member finished. Those counts are
// worked out here, exactly, from both members' full completion lists as
// distinct games, and the diagram always covers both whole histories; the
// filters narrow only the sheet below it. If either history can't be read in
// full the diagram is left out rather than shown with a guess.

// The bot pages shared completions 20 at a time; the sheet runs 24 so its
// rows of six (four, two) come out even.
export const COMPARE_PAGE_SIZE = 24;

export interface CompareMemberOption {
  user_id: string;
  name: string;
}

export type CompareResult =
  | { kind: "none" }
  | { kind: "self" }
  | { kind: "error"; message: string }
  | { kind: "ok"; rows: CommonCompletion[]; total: number; totalPages: number };

export type CompletionOverlap = { onlyLeft: number; both: number; onlyRight: number };

type History = { entries: GameCompletion[]; capped: boolean } | null;

export function compareNameOf(user: User): string {
  return user.global_name ?? user.username ?? user.user_id;
}

// Distinct games per member, then the overlap, from complete histories only.
export function completionOverlap(left: History, right: History): CompletionOverlap | null {
  if (!left || !right || left.capped || right.capped) return null;
  const leftGames = new Set(left.entries.map((e) => e.gamedb_game_id));
  const rightGames = new Set(right.entries.map((e) => e.gamedb_game_id));
  let both = 0;
  for (const game of leftGames) if (rightGames.has(game)) both += 1;
  return { onlyLeft: leftGames.size - both, both, onlyRight: rightGames.size - both };
}

// The picker's members (active, not bots, not the page's own member) by
// name, and the name of the one compared with.
export function compareMembers(allUsers: User[], ownerId: string, withId: string | null) {
  const members: CompareMemberOption[] = allUsers
    .filter((u) => !u.is_bot && !u.server_left_at && u.user_id !== ownerId)
    .map((u) => ({ user_id: u.user_id, name: compareNameOf(u) }))
    .sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }));
  const rightUser = allUsers.find((u) => u.user_id === withId);
  const rightName = rightUser ? compareNameOf(rightUser) : (withId ?? "");
  // Someone picked through a link who isn't in the (active) member list: keep
  // them selectable so the form doesn't silently drop them on resubmit.
  if (withId !== null && withId !== ownerId && !members.some((m) => m.user_id === withId)) {
    members.unshift({ user_id: withId, name: rightName });
  }
  return { members, rightName };
}

async function readAll<T>(res: Response): Promise<T[]> {
  return res.ok ? ((await res.json()) as ApiCollection<T>).data : [];
}

async function compareResult(
  filters: CompareFilters,
  comparable: boolean,
  commonRes: Response | null,
): Promise<CompareResult> {
  if (filters.with === null) return { kind: "none" };
  if (!comparable) return { kind: "self" };
  if (commonRes?.ok) {
    const body: ApiCollection<CommonCompletion> & { meta: CommonCompletionMeta } =
      await commonRes.json();
    const { total, totalPages } = paginationOf(body.meta, body.data.length);
    return { kind: "ok", rows: body.data, total, totalPages };
  }
  return {
    kind: "error",
    message:
      commonRes?.status === 404
        ? "That member couldn't be found."
        : "Couldn't load shared completions. Try again in a moment.",
  };
}

// Everything the compare page shows, or null when the page's member can't be
// read (a 404).
export async function loadComparePage(id: string, filters: CompareFilters) {
  const comparable = filters.with !== null && filters.with !== id;
  const [user, membersRes, platformsRes, commonRes, leftAll, rightAll] = await Promise.all([
    fetchMember(id),
    apiFetch(`/api/v1/users?per=500`, {
      next: { revalidate: MEMBERS_REVALIDATE_SECONDS, tags: ["members"] },
    }),
    apiFetch(`/api/v1/platforms?per=100`, { next: { revalidate: 3600 } }),
    comparable
      ? apiFetch(
          `/api/v1/users/${id}/completions/common?${commonCompletionsQuery(filters, COMPARE_PAGE_SIZE)}`,
          { cache: "no-store" },
        )
      : null,
    comparable ? fetchAllCompletions(id) : null,
    comparable ? fetchAllCompletions(filters.with!) : null,
  ]);
  if (!user) return null;
  const { members, rightName } = compareMembers(await readAll<User>(membersRes), id, filters.with);
  return {
    user,
    members,
    platforms: await readAll<Platform>(platformsRes),
    result: await compareResult(filters, comparable, commonRes),
    overlap: completionOverlap(leftAll, rightAll),
    left: { id, name: compareNameOf(user) },
    right: { id: filters.with ?? "", name: rightName },
  };
}
