import type { MemberProfile } from "@/lib/members/profile-page";
import { resolveEntryId } from "@/lib/api/game-list-entry";
import { MemberShelf, PodiumSpines, Spine } from "@/components/issue/member-shelf";
import { memberListHref } from "@/lib/members/member-lists";
import { memberName } from "@/lib/achievements";
import { mobileCut, shelfMore, spineHref } from "@/components/member/profile/shelf-parts";

// The top shelf: the member's favorites, ranked, the first three on a podium.
export function FavoritesShelf({ profile }: { profile: MemberProfile }) {
  const { user, counts } = profile;
  const favorites = profile.lists.favorites.data;
  return (
    <MemberShelf
      label="Favorites"
      count={counts.favorites}
      blurb={`Ranked by ${memberName(user)}.`}
      links={[{ href: memberListHref(user.user_id, "favorites"), label: "Open list" }]}
      more={shelfMore(user.user_id, "favorites", counts.favorites, favorites.length)}
      empty="No favorites picked yet."
    >
      <PodiumSpines
        items={favorites.slice(0, 3).map((entry) => ({
          href: spineHref(entry),
          game: entry.game,
          title: entry.game?.title ?? "Unknown game",
        }))}
      />
      {favorites.slice(3).map((entry, i) => (
        <Spine
          key={resolveEntryId("favorite", entry) ?? i}
          href={spineHref(entry)}
          game={entry.game}
          title={entry.game?.title ?? "Unknown game"}
          numeral={i + 4}
          height={206}
          className={mobileCut(i + 3)}
        />
      ))}
    </MemberShelf>
  );
}
