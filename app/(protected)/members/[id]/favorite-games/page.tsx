import { notFound } from "next/navigation";
import type { UserFavorite } from "@/lib/api/types";
import { loadMemberList, pageNumber } from "@/lib/members/member-page";
import { MemberListTemplate } from "@/components/templates/member-list-template";
import { memberCounts } from "@/lib/members/member-lists";
import { memberName } from "@/lib/achievements";
import { ListPagination } from "@/components/list-pagination";
import { FavoritesRanking } from "@/components/member/lists/favorites-ranking";

const PAGE_SIZE = 24;

// Favorites, ranked by the member: the podium, then every rank after.
export default async function FavoriteGamesPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const [{ id }, { page }] = await Promise.all([params, searchParams]);
  const currentPage = pageNumber(page);

  const data = await loadMemberList<UserFavorite>(id, "favorites", PAGE_SIZE, currentPage);
  if (!data) notFound();
  const { user, list } = data;

  return (
    <MemberListTemplate
      userId={id}
      displayName={memberName(user)}
      title="Favorite games"
      count={list.total}
      current="favorites"
      counts={memberCounts(user)}
    >
      <FavoritesRanking entries={list.entries} page={currentPage} per={list.per ?? PAGE_SIZE} />

      <ListPagination
        currentPage={currentPage}
        totalPages={list.totalPages}
        buildHref={(p) => `/members/${id}/favorite-games${p > 1 ? `?page=${p}` : ""}`}
      />
    </MemberListTemplate>
  );
}
