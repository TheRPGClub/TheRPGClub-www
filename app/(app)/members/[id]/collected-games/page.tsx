import { notFound } from "next/navigation";
import { Boxes } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type {
  ApiCollection,
  ApiSingle,
  CollectionPlatformSummary,
  GameCollection,
  User,
} from "@/lib/api/types";
import { paginationOf } from "@/lib/api/pagination";
import { MemberGameCard } from "@/components/member/member-game-card";
import { MemberListShell } from "@/components/member/member-list-shell";
import { MemberListPagination } from "@/components/member/member-list-pagination";
import {
  CollectionPlatformStrip,
  collectedGamesHref,
  parsePlatformFilter,
} from "@/components/member/collection-platform-strip";

const PAGE_SIZE = 24;

export default async function CollectedGamesPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string; platform_id?: string }>;
}) {
  const [{ id }, { page = "1", platform_id }] = await Promise.all([
    params,
    searchParams,
  ]);
  const currentPage = Math.max(1, parseInt(page, 10) || 1);
  const platformId = parsePlatformFilter(platform_id);

  const listQuery = new URLSearchParams({
    per: String(PAGE_SIZE),
    page: String(currentPage),
  });
  if (platformId) listQuery.set("platform_id", platformId);

  const [userRes, listRes, summaryRes] = await Promise.all([
    apiFetch(`/api/v1/users/${id}`, { cache: "no-store" }),
    apiFetch(`/api/v1/users/${id}/collections?${listQuery}`, {
      cache: "no-store",
    }),
    apiFetch(`/api/v1/users/${id}/collections/platform_summary`, {
      cache: "no-store",
    }),
  ]);

  if (!userRes.ok) notFound();
  const { data: user }: ApiSingle<User> = await userRes.json();
  const displayName = user.global_name ?? user.username ?? id;

  let entries: GameCollection[] = [];
  let total = 0;
  let totalPages = 1;
  if (listRes.ok) {
    const body: ApiCollection<GameCollection> = await listRes.json();
    entries = body.data;
    // The server owns the split; PAGE_SIZE is only what we asked for.
    const pagination = paginationOf(body.meta, entries.length);
    total = pagination.total;
    totalPages = pagination.totalPages;
  }
  // The strip is an extra: if the summary fails, the list still renders.
  let summary: CollectionPlatformSummary | null = null;
  if (summaryRes.ok) {
    summary = ((await summaryRes.json()) as ApiSingle<CollectionPlatformSummary>)
      .data;
  }
  const href = (p: number) => collectedGamesHref(id, { page: p, platformId });

  return (
    <MemberListShell
      userId={id}
      displayName={displayName}
      title="Collection"
      count={total}
    >
      {summary && summary.total_count > 0 && (
        <CollectionPlatformStrip
          userId={id}
          summary={summary}
          current={platformId}
        />
      )}

      {entries.length === 0 ? (
        <p className="rounded-lg border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
          {platformId
            ? "No owned games on this platform."
            : "No owned games tracked yet."}
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
                  <Boxes className="size-3" />
                  {entry.ownership_type ? ` ${entry.ownership_type}` : " Owned"}
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
