import type { MemberProfile } from "@/lib/members/profile-page";
import { FavoritesShelf } from "@/components/member/profile/favorites-shelf";
import { CompletedShelf } from "@/components/member/profile/completed-shelf";
import { BacklogShelf, CollectionShelf } from "@/components/member/profile/list-shelves";

// Everything but what's being played is closed books on a bookcase, one
// shelf per list; a list whose Feature this viewer isn't shown is left off.
export function ProfileBookcase({ profile }: { profile: MemberProfile }) {
  const { show } = profile;
  return (
    <div data-slot="profile-bookcase" className="border-t-2 border-foreground">
      <FavoritesShelf profile={profile} />
      {show.completed && <CompletedShelf profile={profile} />}
      {show.backlog && <BacklogShelf profile={profile} />}
      {show.collection && <CollectionShelf profile={profile} />}
    </div>
  );
}
