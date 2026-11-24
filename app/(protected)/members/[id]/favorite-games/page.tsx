import { notFound } from "next/navigation";
import type { UserFavorite } from "@/lib/api/types";
import { loadMemberList, pageNumber } from "@/lib/members/member-page";
import { MemberListTemplate } from "@/components/templates/member-list-template";
import { memberCounts } from "@/lib/members/member-lists";
import { memberName } from "@/lib/achievements";
import { ListPagination } from "@/components/list-pagination";
import { FavoritesRanking } from "@/components/member/lists/favorites-ranking";
import { loadShelfOwner } from "@/lib/members/shelf-manage";
import { ShelfManageProvider } from "@/components/member/manage/shelf-manage-context";
import { ShelfAddButton } from "@/components/member/manage/shelf-add-button";
import { OwnedFavorites } from "@/components/member/manage/owned-lists";

const PAGE_SIZE = 24;

// Favorites, ranked by the member: the podium, then every rank after. The
// owner manages and reorders them here (spec api#451, pick 3A).
export default async function FavoriteGamesPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const [{ id }, { page }] = await Promise.all([params, searchParams]);
  const currentPage = pageNumber(page);

  const [data, owner] = await Promise.all([
    loadMemberList<UserFavorite>(id, "favorites", PAGE_SIZE, currentPage),
    loadShelfOwner(id),
  ]);
  if (!data) notFound();
  const { user, list } = data;
  const per = list.per ?? PAGE_SIZE;

  return (
    <ShelfManageProvider
      owner={owner}
      kind="favorite"
      listName="Favorites"
      entries={owner ? list.entries : []}
    >
      <MemberListTemplate
        userId={id}
        displayName={memberName(user)}
        title="Favorite games"
        count={list.total}
        current="favorites"
        counts={memberCounts(user)}
        action={owner && <ShelfAddButton kind="favorite" />}
      >
        {owner ? (
          <OwnedFavorites
            entries={list.entries}
            offset={(currentPage - 1) * per}
          />
        ) : (
          <FavoritesRanking
            entries={list.entries}
            page={currentPage}
            per={per}
          />
        )}

        <ListPagination
          currentPage={currentPage}
          totalPages={list.totalPages}
          buildHref={(p) =>
            `/members/${id}/favorite-games${p > 1 ? `?page=${p}` : ""}`
          }
        />
      </MemberListTemplate>
    </ShelfManageProvider>
  );
}
