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
  type CompareMemberOption,
} from "@/components/member/compare-filters";
import { ListPagination } from "@/components/list-pagination";

// The bot pages shared completions 20 at a time; rows here are tall, so the
// same size keeps a page scannable.
const PAGE_SIZE = 20;
const MEMBERS_REVALIDATE_SECONDS = 300;

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

  const [userRes, membersRes, platformsRes, commonRes] = await Promise.all([
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
  const title =
    result.kind === "ok" ? `Shared completions with ${rightName}` : "Compare completions";

  return (
    <MemberListShell
      userId={id}
      displayName={leftName}
      title={title}
      count={result.kind === "ok" ? result.total : undefined}
    >
      <CompareFiltersForm
        // Remount on navigation so the uncontrolled fields pick up the new
        // URL (e.g. after "Clear filters").
        key={compareHref(id, filters, 1)}
        action={action}
        filters={filters}
        members={members}
        platforms={platforms}
      />

      {result.kind === "none" && (
        <EmptyState>
          Pick a member to see which games you&apos;ve both completed.
        </EmptyState>
      )}
      {result.kind === "self" && (
        <EmptyState>Pick someone other than {leftName} to compare with.</EmptyState>
      )}
      {result.kind === "error" && <EmptyState>{result.message}</EmptyState>}
      {result.kind === "ok" &&
        (result.rows.length === 0 ? (
          <EmptyState>No shared completions matched those filters.</EmptyState>
        ) : (
          <>
            <ul className="space-y-3">
              {result.rows.map((row) => (
                <CompareCompletionRow
                  key={row.gamedb_game_id}
                  row={row}
                  leftName={leftName}
                  rightName={rightName}
                />
              ))}
            </ul>
            <ListPagination
              currentPage={filters.page}
              totalPages={result.totalPages}
              buildHref={(p) => compareHref(id, filters, p)}
            />
          </>
        ))}
    </MemberListShell>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
      {children}
    </p>
  );
}
