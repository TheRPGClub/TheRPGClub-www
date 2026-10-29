import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { getSession } from "@/lib/session";
import type {
  ApiCollection,
  ApiSingle,
  CommonCompletion,
  CommonCompletionMeta,
  Platform,
  User,
} from "@/lib/api/types";
import { MEMBERS_REVALIDATE_SECONDS } from "@/lib/api/members";
import { paginationOf } from "@/lib/api/pagination";
import {
  commonCompletionsQuery,
  compareHref,
  parseCompareFilters,
} from "@/lib/completions-compare";
import { MemberListShell } from "@/components/member/member-list-shell";
import { CompareCompletionRow } from "@/components/member/compare-completion-row";
import {
  CompareFiltersForm,
  CompareMemberForm,
  type CompareMemberOption,
} from "@/components/member/compare-filters";
import { MemberListEmpty } from "@/components/member/member-game-card";
import { memberCounts } from "@/components/member/member-lists";
import { fetchAllCompletions } from "@/components/member/member-lists-server";
import { CompareVenn } from "@/components/issue/member-compare-venn";
import { ListPagination } from "@/components/list-pagination";

// The bot pages shared completions 20 at a time; the sheet runs 24 so its
// rows of six (four, two) come out even.
const PAGE_SIZE = 24;

// Compare completions: the overlap diagram ("only A / both / only B") over a
// contact sheet of the shared games.
//
// The API's `completions/common` gives the shared games (filtered, paged)
// but nothing about the games only one member finished. Those counts are
// worked out here, exactly, from both members' full completion lists as
// distinct games, and the diagram always covers both whole histories; the
// filters narrow only the sheet below it. If either history can't be read in
// full the diagram is left out rather than shown with a guess.

function nameOf(user: User): string {
  return user.global_name ?? user.username ?? user.user_id;
}

type Result =
  | { kind: "none" }
  | { kind: "self" }
  | { kind: "error"; message: string }
  | { kind: "ok"; rows: CommonCompletion[]; total: number; totalPages: number };

export default async function CompareCompletionsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ id }, raw, session] = await Promise.all([
    params,
    searchParams,
    getSession(),
  ]);
  const filters = parseCompareFilters(
    raw,
    id,
    session?.principal.discord_id ?? null,
  );
  const comparable = filters.with !== null && filters.with !== id;

  const [userRes, membersRes, platformsRes, commonRes, leftAll, rightAll] = await Promise.all([
    apiFetch(`/api/v1/users/${id}`, { cache: "no-store" }),
    apiFetch(`/api/v1/users?per=500`, {
      next: { revalidate: MEMBERS_REVALIDATE_SECONDS, tags: ["members"] },
    }),
    apiFetch(`/api/v1/platforms?per=100`, { next: { revalidate: 3600 } }),
    comparable
      ? apiFetch(
          `/api/v1/users/${id}/completions/common?${commonCompletionsQuery(filters, PAGE_SIZE)}`,
          { cache: "no-store" },
        )
      : null,
    comparable ? fetchAllCompletions(id) : null,
    comparable ? fetchAllCompletions(filters.with!) : null,
  ]);

  if (!userRes.ok) notFound();
  const { data: user }: ApiSingle<User> = await userRes.json();
  const leftName = nameOf(user);

  const allUsers: User[] = membersRes.ok
    ? ((await membersRes.json()) as ApiCollection<User>).data
    : [];
  const members: CompareMemberOption[] = allUsers
    .filter((u) => !u.is_bot && !u.server_left_at && u.user_id !== id)
    .map((u) => ({ user_id: u.user_id, name: nameOf(u) }))
    .sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }));

  const platforms: Platform[] = platformsRes.ok
    ? ((await platformsRes.json()) as ApiCollection<Platform>).data
    : [];

  const rightUser = allUsers.find((u) => u.user_id === filters.with);
  const rightName = rightUser ? nameOf(rightUser) : (filters.with ?? "");
  // Someone picked through a link who isn't in the (active) member list: keep
  // them selectable so the form doesn't silently drop them on resubmit.
  if (comparable && !members.some((m) => m.user_id === filters.with)) {
    members.unshift({ user_id: filters.with!, name: rightName });
  }

  let result: Result;
  if (filters.with === null) {
    result = { kind: "none" };
  } else if (!comparable) {
    result = { kind: "self" };
  } else if (commonRes?.ok) {
    const body: ApiCollection<CommonCompletion> & {
      meta: CommonCompletionMeta;
    } = await commonRes.json();
    const pagination = paginationOf(body.meta, body.data.length);
    result = {
      kind: "ok",
      rows: body.data,
      total: pagination.total,
      totalPages: pagination.totalPages,
    };
  } else {
    result = {
      kind: "error",
      message:
        commonRes?.status === 404
          ? "That member couldn't be found."
          : "Couldn't load shared completions. Try again in a moment.",
    };
  }

  const action = `/members/${id}/completed-games/compare`;

  // Distinct games per member, then the overlap, from complete histories
  // only.
  let venn: { onlyLeft: number; both: number; onlyRight: number } | null = null;
  if (leftAll && rightAll && !leftAll.capped && !rightAll.capped) {
    const leftGames = new Set(leftAll.entries.map((e) => e.gamedb_game_id));
    const rightGames = new Set(rightAll.entries.map((e) => e.gamedb_game_id));
    let both = 0;
    for (const game of leftGames) if (rightGames.has(game)) both += 1;
    venn = {
      onlyLeft: leftGames.size - both,
      both,
      onlyRight: rightGames.size - both,
    };
  }
  const filtered = Boolean(filters.year || filters.platform || filters.q);
  const left = { id, name: leftName };
  const right = { id: filters.with ?? "", name: rightName };

  return (
    <MemberListShell
      userId={id}
      displayName={leftName}
      title="Compare completions"
      counts={memberCounts(user)}
      current="completed"
    >
      <CompareMemberForm
        // Remount on navigation so the uncontrolled select picks up the URL.
        key={`member-${filters.with ?? ""}`}
        action={action}
        ownerName={leftName}
        filters={filters}
        members={members}
      />

      {result.kind === "none" && (
        <MemberListEmpty>
          Pick a member to see which games you&apos;ve both completed.
        </MemberListEmpty>
      )}
      {result.kind === "self" && (
        <MemberListEmpty>
          Pick someone other than {leftName} to compare with.
        </MemberListEmpty>
      )}
      {result.kind === "error" && <MemberListEmpty>{result.message}</MemberListEmpty>}

      {result.kind === "ok" && (
        <>
          {venn && (
            <div className="space-y-1">
              <CompareVenn
                left={{ ...left, only: venn.onlyLeft, href: `/members/${id}/completed-games` }}
                right={{
                  ...right,
                  only: venn.onlyRight,
                  href: `/members/${right.id}/completed-games`,
                }}
                both={venn.both}
              />
              <p className="text-center text-xs text-paper-mute">
                Distinct games across every completion each has logged
                {filtered ? "; the filters below narrow the shared list only." : "."}
              </p>
            </div>
          )}

          <CompareFiltersForm
            // Remount on navigation so the uncontrolled fields pick up the new
            // URL (e.g. after "Clear").
            key={compareHref(id, filters, 1)}
            action={action}
            filters={filters}
            platforms={platforms}
            heading={
              filtered
                ? `${result.total} shared ${result.total === 1 ? "game matches" : "games match"}`
                : `The ${result.total} in common`
            }
          />

          {result.rows.length === 0 ? (
            <MemberListEmpty>
              {filtered
                ? "No shared completions matched those filters."
                : `${leftName} and ${rightName} haven't completed any of the same games yet.`}
            </MemberListEmpty>
          ) : (
            <ul className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4 lg:grid-cols-6">
              {result.rows.map((row) => (
                <CompareCompletionRow
                  key={row.gamedb_game_id}
                  row={row}
                  left={left}
                  right={right}
                />
              ))}
            </ul>
          )}
          <ListPagination
            currentPage={filters.page}
            totalPages={result.totalPages}
            buildHref={(p) => compareHref(id, filters, p)}
          />
        </>
      )}
    </MemberListShell>
  );
}

