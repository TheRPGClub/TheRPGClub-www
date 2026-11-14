import { notFound } from "next/navigation";
import { loadCollectionPage } from "@/lib/members/collection-page";
import { pageNumber } from "@/lib/members/member-page";
import { MemberListTemplate } from "@/components/templates/member-list-template";
import { memberCounts, memberName } from "@/components/member/member-lists";
import { ListPagination } from "@/components/list-pagination";
import {
  CollectionPlatformStrip,
  collectedGamesHref,
  parsePlatformFilter,
} from "@/components/member/collection-platform-strip";
import { CollectionGrid } from "@/components/member/lists/collection-grid";
import { ImportLink } from "@/components/member/lists/import-link";

// The collection: owned games, filtered by the platform strip, each with how
// it's owned.
export default async function CollectedGamesPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string; platform_id?: string }>;
}) {
  const [{ id }, { page, platform_id }] = await Promise.all([params, searchParams]);
  const currentPage = pageNumber(page);
  const platformId = parsePlatformFilter(platform_id);

  const data = await loadCollectionPage(id, currentPage, platformId);
  if (!data) notFound();
  const { user, list, summary } = data;

  return (
    <MemberListTemplate
      userId={id}
      displayName={memberName(user)}
      title="Collection"
      count={list.total}
      current="collection"
      counts={memberCounts(user)}
      action={data.canImport && <ImportLink userId={id} />}
    >
      {summary && summary.total_count > 0 && (
        <CollectionPlatformStrip userId={id} summary={summary} current={platformId} />
      )}

      <CollectionGrid entries={list.entries} filtered={platformId !== null} />

      <ListPagination
        currentPage={currentPage}
        totalPages={list.totalPages}
        buildHref={(p) => collectedGamesHref(id, { page: p, platformId })}
      />
    </MemberListTemplate>
  );
}
