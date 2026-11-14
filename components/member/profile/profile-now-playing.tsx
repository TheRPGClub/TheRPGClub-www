import type { MemberProfile } from "@/lib/members/profile-page";
import { DetailSection, SectionLink } from "@/components/templates/detail-template";
import { NowPlayingBooks } from "@/components/issue/member-now-playing";
import { memberListHref } from "@/components/member/member-lists";
import { ProfileEmpty } from "@/components/member/profile/profile-empty";

// What the member is playing now, open on the desk (face-on key art).
export function ProfileNowPlaying({ profile }: { profile: MemberProfile }) {
  const { user, counts, lists } = profile;
  const nowPlaying = lists.nowPlaying.data;
  return (
    <DetailSection
      id="now-playing"
      title="Now playing"
      count={counts.now_playing}
      action={
        counts.now_playing > 0 && (
          <SectionLink href={memberListHref(user.user_id, "now_playing")}>See all</SectionLink>
        )
      }
      className="space-y-4.5"
    >
      {nowPlaying.length > 0 ? (
        <NowPlayingBooks entries={nowPlaying} />
      ) : (
        <ProfileEmpty>Nothing in progress right now.</ProfileEmpty>
      )}
    </DetailSection>
  );
}
