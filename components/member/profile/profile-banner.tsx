import type { MemberProfile } from "@/lib/members/profile-page";
import { bannerArt } from "@/lib/members/profile-page";
import { importsHubHref } from "@/lib/imports/kinds";
import { MemberBanner } from "@/components/issue/member-banner";
import { memberName } from "@/components/member/member-lists";

// The profile's hero: the member's masthead, wearing their own pick's art,
// with edit and imports on their own page.
export function ProfileBanner({ profile }: { profile: MemberProfile }) {
  const { user, isSelf, show, lists } = profile;
  return (
    <MemberBanner
      userId={user.user_id}
      displayName={memberName(user)}
      username={user.username}
      joinedAt={user.server_joined_at}
      membership={user.membership}
      socials={user.socials ?? []}
      art={bannerArt(lists.favorites.data, lists.nowPlaying.data)}
      owner={
        isSelf
          ? {
              editHref: `/members/${user.user_id}/edit`,
              importsHref: show.imports ? importsHubHref(user.user_id) : null,
            }
          : null
      }
    />
  );
}
