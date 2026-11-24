import { notFound } from "next/navigation";
import { loadMemberProfile } from "@/lib/members/profile-page";
import { MemberAchievementsSection } from "@/components/achievements/member-achievements-section";
import { BackLink } from "@/components/shell/back-link";
import { ProfileBanner } from "@/components/member/profile/profile-banner";
import { ProfileBookcase } from "@/components/member/profile/profile-bookcase";
import { ProfileJournal } from "@/components/member/profile/profile-journal";
import { ProfileNowPlaying } from "@/components/member/profile/profile-now-playing";
import { ProfileReviews } from "@/components/member/profile/profile-reviews";
import { ProfileRuns } from "@/components/member/profile/profile-runs";
import { DetailTemplate } from "@/components/templates/detail-template";
import { ProfileLists } from "@/components/game-lists/profile/profile-lists";

// A member's page reads as one idea: what they're playing now is open on the
// desk, everything else is closed books on a bookcase, one shelf per list,
// then their Achievements, latest reviews and Game Journal. Read-only;
// managing the lists lives on the edit page.

export default async function MemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await loadMemberProfile(id);
  if (!profile) notFound();
  const { show, achievements, runs, gameLists } = profile;

  return (
    <DetailTemplate
      className="space-y-10"
      hero={
        <div className="flex flex-col">
          <BackLink href="/members" label="Members" />
          <ProfileBanner profile={profile} />
        </div>
      }
    >
      {show.nowPlaying && <ProfileNowPlaying profile={profile} />}
      {/* Game Lists: another member's with none show nothing (the Empty
          Track Rule); your own invites you to start one. */}
      {gameLists && (gameLists.length > 0 || profile.isSelf) && (
        <ProfileLists lists={gameLists} own={profile.isSelf} now={new Date().toISOString()} />
      )}
      <ProfileBookcase profile={profile} />
      {/* The Challenges department: hidden with the Feature, or unread. */}
      {show.challenges && runs && <ProfileRuns runs={runs} isSelf={profile.isSelf} />}
      {/* Opt-in: only members with a Linked Account get the department. */}
      {achievements?.status === "ok" && (
        <MemberAchievementsSection summary={achievements.summary} />
      )}
      {show.reviews && <ProfileReviews profile={profile} />}
      {show.journal && <ProfileJournal profile={profile} />}
    </DetailTemplate>
  );
}
