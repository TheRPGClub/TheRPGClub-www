import Link from "next/link";
import { notFound } from "next/navigation";
import { Dices } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { getSession } from "@/lib/session";
import type {
  ApiCollection,
  ApiSingle,
  User,
  UserBacklog,
} from "@/lib/api/types";
import { paginationOf } from "@/lib/api/pagination";
import {
  MemberGameCard,
  MemberListEmpty,
  memberGridClass,
} from "@/components/member/member-game-card";
import { MemberListShell } from "@/components/member/member-list-shell";
import {
  memberCounts,
  memberName,
  shortDate,
} from "@/components/member/member-lists";
import { ListPagination } from "@/components/list-pagination";
import { buttonVariants } from "@/components/ui/button";

const PAGE_SIZE = 24;

// The backlog: what's queued up, in the member's order, each with its note
// and when it went on the list. The owner can have one picked for them.
export default async function BackloggedGamesPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const [{ id }, { page = "1" }] = await Promise.all([params, searchParams]);
  const currentPage = Math.max(1, parseInt(page, 10) || 1);

  const [userRes, listRes, session] = await Promise.all([
    apiFetch(`/api/v1/users/${id}`, { cache: "no-store" }),
    apiFetch(`/api/v1/users/${id}/backlog?per=${PAGE_SIZE}&page=${currentPage}`, {
      cache: "no-store",
    }),
    getSession(),
  ]);
  const isSelf = session?.principal.discord_id === id;

  if (!userRes.ok) notFound();
  const { data: user }: ApiSingle<User> = await userRes.json();
  const displayName = memberName(user);

  let entries: UserBacklog[] = [];
  let total = 0;
  let totalPages = 1;
  if (listRes.ok) {
    const body: ApiCollection<UserBacklog> = await listRes.json();
    entries = body.data;
    // The server owns the split; PAGE_SIZE is only what we asked for.
    const pagination = paginationOf(body.meta, entries.length);
    total = pagination.total;
    totalPages = pagination.totalPages;
  }
  const href = (p: number) =>
    `/members/${id}/backlogged-games${p > 1 ? `?page=${p}` : ""}`;

  return (
    <MemberListShell
      userId={id}
      displayName={displayName}
      title="Backlog"
      count={total}
      current="backlog"
      counts={memberCounts(user)}
      action={
        isSelf ? (
          <Link
            href={`/members/${id}/backlogged-games/pick`}
            className={buttonVariants({ variant: "highlight" })}
          >
            <Dices data-icon="inline-start" />
            Pick something to play
          </Link>
        ) : undefined
      }
    >
      {entries.length === 0 ? (
        <MemberListEmpty>Nothing in the backlog yet.</MemberListEmpty>
      ) : (
        <ul className={memberGridClass}>
          {entries.map((entry, i) => {
            const added = shortDate(entry.created_at);
            return (
              <li key={entry.entry_id ?? entry.backlog_id ?? i}>
                <MemberGameCard
                  game={entry.game}
                  platform={entry.platform}
                  note={entry.note}
                  meta={added ? <>Queued {added}</> : undefined}
                />
              </li>
            );
          })}
        </ul>
      )}

      <ListPagination
        currentPage={currentPage}
        totalPages={totalPages}
        buildHref={href}
      />
    </MemberListShell>
  );
}
