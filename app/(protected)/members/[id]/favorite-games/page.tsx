import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api";
import type {
  ApiCollection,
  ApiSingle,
  User,
  UserFavorite,
} from "@/lib/api/types";
import { paginationOf } from "@/lib/api/pagination";
import { FavoritesPodium } from "@/components/issue/member-podium";
import {
  MemberGameCard,
  MemberListEmpty,
  memberGridClass,
} from "@/components/member/member-game-card";
import { MemberListShell } from "@/components/member/member-list-shell";
import { memberCounts, memberName } from "@/components/member/member-lists";
import { ListPagination } from "@/components/list-pagination";

const PAGE_SIZE = 24;

// Favorites, ranked by the member (the API's `sort_order`). The first page
// opens on the podium for the top three; every rank after sits level in the
// grid, its number over the cover.
export default async function FavoriteGamesPage({
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
      `/api/v1/users/${id}/favorites?per=${PAGE_SIZE}&page=${currentPage}`,
      { cache: "no-store" },
    ),
  ]);

  if (!userRes.ok) notFound();
  const { data: user }: ApiSingle<User> = await userRes.json();
  const displayName = memberName(user);

  let entries: UserFavorite[] = [];
  let total = 0;
  let totalPages = 1;
  let per = PAGE_SIZE;
  if (listRes.ok) {
    const body: ApiCollection<UserFavorite> = await listRes.json();
    entries = body.data;
    // The server owns the split; PAGE_SIZE is only what we asked for.
    const pagination = paginationOf(body.meta, entries.length);
    total = pagination.total;
    totalPages = pagination.totalPages;
    const served = (body.meta as { per?: unknown } | undefined)?.per;
    if (typeof served === "number" && served > 0) per = served;
  }
  const href = (p: number) =>
    `/members/${id}/favorite-games${p > 1 ? `?page=${p}` : ""}`;

  // Ranks run across pages: the API orders by the member's sort order.
  const offset = (currentPage - 1) * per;
  const podium = currentPage === 1 ? entries.slice(0, 3) : [];
  const rest = currentPage === 1 ? entries.slice(3) : entries;

  return (
    <MemberListShell
      userId={id}
      displayName={displayName}
      title="Favorite games"
      count={total}
      current="favorites"
      counts={memberCounts(user)}
    >
      {entries.length === 0 ? (
        <MemberListEmpty>No favorites yet.</MemberListEmpty>
      ) : (
        <div className="space-y-12">
          {podium.length > 0 && <FavoritesPodium entries={podium} />}
          {rest.length > 0 && (
            <ol className={memberGridClass}>
              {rest.map((entry, i) => (
                <li key={entry.entry_id ?? entry.favorite_id ?? i}>
                  <MemberGameCard
                    game={entry.game}
                    platform={entry.platform}
                    note={entry.note}
                    numeral={offset + podium.length + i + 1}
                  />
                </li>
              ))}
            </ol>
          )}
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
