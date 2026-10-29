import { notFound } from "next/navigation";
import Link from "next/link";
import { Download, FileUp, GitCompareArrows, Trophy } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { getSession } from "@/lib/session";
import type {
  ApiCollection,
  ApiSingle,
  GameCompletion,
  User,
} from "@/lib/api/types";
import { paginationOf } from "@/lib/api/pagination";
import { formatCompletedMonth } from "@/lib/completions";
import { MemberGameCard } from "@/components/member/member-game-card";
import { MemberListShell } from "@/components/member/member-list-shell";
import { ListPagination } from "@/components/list-pagination";
import { buttonVariants } from "@/components/ui/button";
import { importsHubHref } from "@/lib/imports/kinds";

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

  const [session, userRes, listRes] = await Promise.all([
    getSession(),
    apiFetch(`/api/v1/users/${id}`, { cache: "no-store" }),
    apiFetch(
      `/api/v1/users/${id}/completions?per=${PAGE_SIZE}&page=${currentPage}`,
      { cache: "no-store" },
    ),
  ]);

  if (!userRes.ok) notFound();
  const { data: user }: ApiSingle<User> = await userRes.json();
  const displayName = user.global_name ?? user.username ?? id;
  const isSelf = session?.principal.discord_id === id;

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
      action={
        <div className="flex items-center gap-2">
          <Link
            href={`/members/${id}/completed-games/compare`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <GitCompareArrows /> Compare
          </Link>
          {isSelf && (
            // A plain link, not next/link: the route handler answers with an
            // attachment, so the browser downloads it instead of navigating.
            <a
              href={`/api/members/${id}/completions/export`}
              download="completions.csv"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <Download /> Export CSV
            </a>
          )}
          {isSelf && (
            <Link
              href={importsHubHref(id)}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <FileUp /> Import
            </Link>
          )}
        </div>
      }
    >
      {entries.length === 0 ? (
        <p className="rounded-lg border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
          No completed games yet.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {entries.map((entry) => {
            const completed = formatCompletedMonth(entry.completed_at);
            return (
              <MemberGameCard
                key={entry.completion_id}
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

      <ListPagination
        currentPage={currentPage}
        totalPages={totalPages}
        buildHref={href}
      />
    </MemberListShell>
  );
}
