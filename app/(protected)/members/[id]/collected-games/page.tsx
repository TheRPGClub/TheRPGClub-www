import { notFound } from "next/navigation";
import { loadCollectionPage } from "@/lib/members/collection-page";
import { pageNumber } from "@/lib/members/member-page";
import { MemberListTemplate } from "@/components/templates/member-list-template";
import { memberCounts } from "@/lib/members/member-lists";
import { memberName } from "@/lib/achievements";
import { ListPagination } from "@/components/list-pagination";
import { CollectionPlatformStrip } from "@/components/member/collection-platform-strip";
import {
  collectedGamesHref,
  parsePlatformFilter,
} from "@/lib/members/collection-filter";
import { CollectionGrid } from "@/components/member/lists/collection-grid";
import { ImportLink } from "@/components/member/lists/import-link";
import { loadShelfOwner } from "@/lib/members/shelf-manage";
import { ShelfManageProvider } from "@/components/member/manage/shelf-manage-context";
import { ShelfAddButton } from "@/components/member/manage/shelf-add-button";
import { OwnedCollection } from "@/components/member/manage/owned-collection";

// The collection: owned games, filtered by the platform strip, each with how
// it's owned. The owner manages it here (spec api#451, pick 3A).
export default async function CollectedGamesPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string; platform_id?: string }>;
}) {
  const [{ id }, { page, platform_id }] = await Promise.all([
    params,
    searchParams,
  ]);
  const currentPage = pageNumber(page);
  const platformId = parsePlatformFilter(platform_id);

  const [data, owner] = await Promise.all([
    loadCollectionPage(id, currentPage, platformId),
    loadShelfOwner(id),
  ]);
  if (!data) notFound();
  const { user, list, summary } = data;

  return (
    <ShelfManageProvider
      owner={owner}
      kind="collection"
      listName="Collection"
      entries={owner ? list.entries : []}
    >
      <MemberListTemplate
        userId={id}
        displayName={memberName(user)}
        title="Collection"
        count={list.total}
        current="collection"
        counts={memberCounts(user)}
        action={
          <>
            {data.canImport && <ImportLink userId={id} />}
            {owner && <ShelfAddButton kind="collection" />}
          </>
        }
      >
        {summary && summary.total_count > 0 && (
          <CollectionPlatformStrip
            userId={id}
            summary={summary}
            current={platformId}
          />
        )}

        {owner ? (
          <OwnedCollection
            entries={list.entries}
            filtered={platformId !== null}
          />
        ) : (
          <CollectionGrid
            entries={list.entries}
            filtered={platformId !== null}
          />
        )}

        <ListPagination
          currentPage={currentPage}
          totalPages={list.totalPages}
          buildHref={(p) => collectedGamesHref(id, { page: p, platformId })}
        />
      </MemberListTemplate>
    </ShelfManageProvider>
  );
}
