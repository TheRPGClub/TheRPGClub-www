import { apiFetch } from "@/lib/api";
import type {
  ApiCollection,
  CommonCompletion,
  CommonCompletionMeta,
  User,
} from "@/lib/api/types";
import { MEMBERS_REVALIDATE_SECONDS } from "@/lib/api/members";
import { paginationOf } from "@/lib/api/pagination";
import { commonCompletionsQuery, type CompareFilters } from "@/lib/completions-compare";
import { fetchMember } from "@/lib/members/member-page";
import { fetchMemberDirectory, fetchPlatforms } from "@/lib/api/shared";

// Compare completions: the overlap diagram ("only A / both / only B") over a
// contact sheet of the shared games.
//
// The API's `completions/common` gives the shared games (filtered, paged)
// and, in its meta, the overlap counts over both members' whole histories as
// distinct games: the diagram always covers both whole histories; the
// filters narrow only the sheet below it. Without those counts (an older
// API, or a failed read) the diagram is left out rather than guessed.

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

export function compareNameOf(user: User): string {
  return user.global_name ?? user.username ?? user.user_id;
}

// The diagram's counts from `completions/common`'s meta, or null without them.
export function completionOverlap(meta: CommonCompletionMeta | null): CompletionOverlap | null {
  const overlap = meta?.overlap;
  if (!overlap) return null;
  return { onlyLeft: overlap.only_left, both: overlap.both, onlyRight: overlap.only_right };
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

type CommonBody = ApiCollection<CommonCompletion> & { meta: CommonCompletionMeta };

async function compareResult(
  filters: CompareFilters,
  comparable: boolean,
  commonRes: Response | null,
  body: CommonBody | null,
): Promise<CompareResult> {
  if (filters.with === null) return { kind: "none" };
  if (!comparable) return { kind: "self" };
  if (body) {
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
  const [user, allMembers, platforms, commonRes] = await Promise.all([
    fetchMember(id),
    fetchMemberDirectory<User>(MEMBERS_REVALIDATE_SECONDS),
    fetchPlatforms(),
    comparable
      ? apiFetch(
          `/api/v1/users/${id}/completions/common?${commonCompletionsQuery(filters, COMPARE_PAGE_SIZE)}`,
          { cache: "no-store" },
        )
      : null,
  ]);
  if (!user) return null;
  const body: CommonBody | null = commonRes?.ok ? await commonRes.json() : null;
  const { members, rightName } = compareMembers(allMembers ?? [], id, filters.with);
  return {
    user,
    members,
    platforms: platforms ?? [],
    result: await compareResult(filters, comparable, commonRes, body),
    overlap: completionOverlap(body?.meta ?? null),
    left: { id, name: compareNameOf(user) },
    right: { id: filters.with ?? "", name: rightName },
  };
}
