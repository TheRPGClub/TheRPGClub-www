import Link from "next/link";
import { notFound } from "next/navigation";
import { BookMarked, Dices } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { getSession } from "@/lib/session";
import type {
  ApiCollection,
  ApiSingle,
  User,
  UserBacklog,
} from "@/lib/api/types";
import { paginationOf } from "@/lib/api/pagination";
import { MemberGameCard } from "@/components/member/member-game-card";
import { MemberListShell } from "@/components/member/member-list-shell";
import { ListPagination } from "@/components/list-pagination";
import { buttonVariants } from "@/components/ui/button";

const PAGE_SIZE = 24;

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
  const displayName = user.global_name ?? user.username ?? id;

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
      action={
        isSelf ? (
          <Link
            href={`/members/${id}/backlogged-games/pick`}
            className={buttonVariants({ variant: "outline" })}
          >
            <Dices />
            Pick something to play
          </Link>
        ) : undefined
      }
    >
      {entries.length === 0 ? (
        <p className="rounded-lg border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
          Nothing in the backlog yet.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {entries.map((entry) => (
            <MemberGameCard
              key={entry.entry_id}
              game={entry.game}
              platform={entry.platform}
              note={entry.note}
              meta={
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <BookMarked className="size-3" /> Backlog
                </span>
              }
            />
          ))}
        </div>
      )}

      <ListPagination
        currentPage={currentPage}
        totalPages={totalPages}
        buildHref={href}
      />
    </MemberListShell>
  );
}
