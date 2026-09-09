import { notFound } from "next/navigation";
import { Trophy } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type {
  ApiCollection,
  ApiSingle,
  GameCompletion,
  User,
} from "@/lib/api/types";
import { paginationOf } from "@/lib/api/pagination";
import { MemberGameCard } from "@/components/member/member-game-card";
import { MemberListShell } from "@/components/member/member-list-shell";
import { MemberListPagination } from "@/components/member/member-list-pagination";

const PAGE_SIZE = 24;

export default async function CompletedGamesPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const [{ id }, { page = "1" }] = await Promise.all([params, searchParams]);
  const currentPage = Math.max(1, parseInt(page, 10) || 1);

  const [userRes, listRes] = await Promise.all([
    apiFetch(`/api/v1/users/${id}`, { cache: "no-store" }),
    apiFetch(
      `/api/v1/users/${id}/completions?per=${PAGE_SIZE}&page=${currentPage}`,
      { cache: "no-store" },
    ),
  ]);

  if (!userRes.ok) notFound();
  const { data: user }: ApiSingle<User> = await userRes.json();
  const displayName = user.global_name ?? user.username ?? id;

  let entries: GameCompletion[] = [];
  let total = 0;
  let totalPages = 1;
  if (listRes.ok) {
    const body: ApiCollection<GameCompletion> = await listRes.json();
    entries = body.data;
    // The server owns the split; PAGE_SIZE is only what we asked for.
    const pagination = paginationOf(body.meta, entries.length);
    total = pagination.total;
    totalPages = pagination.totalPages;
  }
  const href = (p: number) =>
    `/members/${id}/completed-games${p > 1 ? `?page=${p}` : ""}`;

  return (
    <MemberListShell
      userId={id}
      displayName={displayName}
      title="Completed games"
      count={total}
    >
      {entries.length === 0 ? (
        <p className="rounded-lg border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
          No completed games yet.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {entries.map((entry) => {
            const completed = entry.completion_date
              ? new Date(entry.completion_date).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                })
              : null;
            return (
              <MemberGameCard
                key={entry.entry_id}
                game={entry.game}
                platform={entry.platform}
                note={entry.note}
                meta={
                  <span className="inline-flex items-center gap-1 text-xs text-brand-500">
                    <Trophy className="size-3" /> {completed ?? "Completed"}
                  </span>
                }
              />
            );
          })}
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
