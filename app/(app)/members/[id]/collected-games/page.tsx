import Link from "next/link";
import { notFound } from "next/navigation";
import { FileUp } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { getSession } from "@/lib/session";
import type {
  ApiCollection,
  ApiSingle,
  CollectionPlatformSummary,
  GameCollection,
  User,
} from "@/lib/api/types";
import { paginationOf } from "@/lib/api/pagination";
import {
  MemberGameCard,
  MemberListEmpty,
  memberGridClass,
} from "@/components/member/member-game-card";
import { MemberListShell } from "@/components/member/member-list-shell";
import { memberCounts, memberName } from "@/components/member/member-lists";
import { ListPagination } from "@/components/list-pagination";
import {
  CollectionPlatformStrip,
  collectedGamesHref,
  parsePlatformFilter,
} from "@/components/member/collection-platform-strip";
import { buttonVariants } from "@/components/ui/button";
import { importsHubHref } from "@/lib/imports/kinds";

const PAGE_SIZE = 24;

// The collection: owned games, filtered by the platform strip, each with how
// it's owned.
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

  const [session, userRes, listRes, summaryRes] = await Promise.all([
    getSession(),
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
  const displayName = memberName(user);
  const isSelf = session?.principal.discord_id === id;

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
      current="collection"
      counts={memberCounts(user)}
      action={
        isSelf && (
          <Link
            href={importsHubHref(id)}
            className={buttonVariants({ variant: "outline" })}
          >
            <FileUp data-icon="inline-start" /> Import
          </Link>
        )
      }
    >
      {summary && summary.total_count > 0 && (
        <CollectionPlatformStrip
          userId={id}
          summary={summary}
          current={platformId}
        />
      )}

      {entries.length === 0 ? (
        <MemberListEmpty>
          {platformId
            ? "No owned games on this platform."
            : "No owned games tracked yet."}
        </MemberListEmpty>
      ) : (
        <ul className={memberGridClass}>
          {entries.map((entry, i) => (
            <li key={entry.entry_id ?? entry.collection_id ?? i}>
              <MemberGameCard
                game={entry.game}
                platform={entry.platform}
                note={entry.note}
                meta={entry.ownership_type || "Owned"}
              />
            </li>
          ))}
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
