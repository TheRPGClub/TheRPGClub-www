import { notFound } from "next/navigation";
import { BookMarked } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type {
  ApiCollection,
  ApiSingle,
  User,
  UserBacklog,
} from "@/lib/api/types";
import { MemberGameCard } from "@/components/member/member-game-card";
import { MemberListShell } from "@/components/member/member-list-shell";
import { MemberListPagination } from "@/components/member/member-list-pagination";

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
  const offset = (currentPage - 1) * PAGE_SIZE;

  const [userRes, listRes] = await Promise.all([
    apiFetch(`/api/v1/users/${id}`, { cache: "no-store" }),
    apiFetch(`/api/v1/users/${id}/backlog?limit=${PAGE_SIZE}&offset=${offset}`, {
      cache: "no-store",
    }),
  ]);

  if (!userRes.ok) notFound();
  const { data: user }: ApiSingle<User> = await userRes.json();
  const displayName = user.global_name ?? user.username ?? id;

  let entries: UserBacklog[] = [];
  let total = 0;
  if (listRes.ok) {
    const body: ApiCollection<UserBacklog> = await listRes.json();
    entries = body.data;
    total = body.meta.total ?? entries.length;
  }
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const href = (p: number) =>
    `/members/${id}/backlogged-games${p > 1 ? `?page=${p}` : ""}`;

  return (
    <MemberListShell
      userId={id}
      displayName={displayName}
      title="Backlog"
      count={total}
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

      <MemberListPagination
        currentPage={currentPage}
        totalPages={totalPages}
        buildHref={href}
      />
    </MemberListShell>
  );
}
