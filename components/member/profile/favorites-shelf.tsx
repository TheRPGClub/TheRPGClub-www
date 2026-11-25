import type { MemberProfile } from "@/lib/members/profile-page";
import { resolveEntryId } from "@/lib/api/member-shelf-entry";
import { MemberShelf, PodiumSpines, Spine } from "@/components/issue/member-shelf";
import { memberListHref } from "@/lib/members/member-lists";
import { memberName } from "@/lib/achievements";
import { addedMonth } from "@/lib/members/profile-playtime";
import {
  MOST_PLAYED_BLURB,
  mobileCut,
  shelfMore,
  spineHours,
  spineHref,
  spineLift,
} from "@/components/member/profile/shelf-parts";
import { ShelfPlaytimeHead } from "@/components/member/profile/shelf-playtime-head";
import { SpineLiftRow } from "@/components/member/profile/spine-lift-row";

// The top shelf: the member's favorites, ranked, the first three on a
// podium. Sorted Most played, the podium steps down and every spine stands
// level, tagged with its hours.
export function FavoritesShelf({ profile }: { profile: MemberProfile }) {
  const { user, counts, playtime, sorts } = profile;
  const favorites = profile.lists.favorites.data;
  const mostPlayed = sorts.favorites === "most_played";
  const spine = (entry: (typeof favorites)[number], i: number) => ({
    href: spineHref(entry),
    game: entry.game,
    title: entry.game?.title ?? "Unknown game",
    lift: spineLift(entry.playtime_minutes, favoriteSub(mostPlayed ? null : i + 1, addedMonth(entry.added_at))),
  });
  const podium = mostPlayed ? [] : favorites.slice(0, 3);
  return (
    <MemberShelf
      label="Favorites"
      count={counts.favorites}
      blurb={mostPlayed ? MOST_PLAYED_BLURB : `Ranked by ${memberName(user)}.`}
      aside={
        <ShelfPlaytimeHead
          userId={user.user_id}
          shelf="favorites"
          label="Favorites"
          minutes={playtime?.shelves.favorites}
          sorts={sorts}
          ownOrder="Ranked"
        />
      }
      Row={SpineLiftRow}
      links={[{ href: memberListHref(user.user_id, "favorites"), label: "Open list" }]}
      more={shelfMore(user.user_id, "favorites", counts.favorites, favorites.length)}
      empty="No favorites picked yet."
    >
      {podium.length > 0 && <PodiumSpines items={podium.map(spine)} />}
      {favorites.slice(podium.length).map((entry, i) => (
        <Spine
          key={resolveEntryId("favorite", entry) ?? i}
          {...spine(entry, i + podium.length)}
          numeral={mostPlayed ? undefined : i + 4}
          tag={mostPlayed ? spineHours(entry.playtime_minutes) : undefined}
          height={206}
          className={mobileCut(i + podium.length)}
        />
      ))}
    </MemberShelf>
  );
}

// A lifted favorite's tag: its rank (when ranked) and when it was added,
// "Favorite No. 3 · Sep 26", or "Favorited Sep 26" sorted Most played.
function favoriteSub(rank: number | null, added: string | null): string {
  if (rank == null) return added ? `Favorited ${added}` : "Favorite";
  return added ? `Favorite No. ${rank} · ${added}` : `Favorite No. ${rank}`;
}
