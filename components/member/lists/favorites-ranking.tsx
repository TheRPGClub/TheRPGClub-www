import type { UserFavorite } from "@/lib/api/types";
import { FavoritesPodium } from "@/components/issue/member-podium";
import {
  MemberGameCard,
  MemberListEmpty,
  memberGridClass,
} from "@/components/member/member-game-card";

// Favorites, ranked by the member (the API's `sort_order`). The first page
// opens on the podium for the top three; every rank after sits level in the
// grid, its number over the cover. Ranks run across pages.
export function FavoritesRanking({
  entries,
  page,
  per,
}: {
  entries: UserFavorite[];
  page: number;
  // The page size the server used.
  per: number;
}) {
  if (entries.length === 0) {
    return <MemberListEmpty>No favorites yet.</MemberListEmpty>;
  }
  const offset = (page - 1) * per;
  const podium = page === 1 ? entries.slice(0, 3) : [];
  const rest = page === 1 ? entries.slice(3) : entries;
  return (
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
  );
}
