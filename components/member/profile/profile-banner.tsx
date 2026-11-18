import type { MemberProfile } from "@/lib/members/profile-page";
import { bannerArt } from "@/lib/members/profile-page";
import { importsHubHref } from "@/lib/imports/kinds";
import { MemberBanner } from "@/components/issue/member-banner";
import { memberName } from "@/lib/achievements";
import { profileBirthday } from "@/lib/birthday";
import { clubToday } from "@/lib/challenges/dates";

// The profile's hero: the member's masthead, wearing their own pick's art,
// with edit and imports on their own page. Their Birthday shows only when
// they share it, and "today" is the club's (America/New_York).
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
      birthday={profileBirthday(user.birthday, clubToday())}
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
