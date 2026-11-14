import type { MemberProfile } from "@/lib/members/profile-page";
import { DetailSection, SectionLink } from "@/components/templates/detail-template";
import { MemberReviewRows } from "@/components/issue/member-review-rows";
import { memberListHref } from "@/components/member/member-lists";
import { ProfileEmpty } from "@/components/member/profile/profile-empty";

// The member's latest reviews.
export function ProfileReviews({ profile }: { profile: MemberProfile }) {
  const { user, counts, lists } = profile;
  const reviews = lists.reviews.data;
  return (
    <DetailSection
      id="reviews"
      title="Reviews"
      count={counts.reviews}
      action={
        counts.reviews > 0 && (
          <SectionLink href={memberListHref(user.user_id, "reviews")}>See all</SectionLink>
        )
      }
      className="space-y-1"
    >
      {reviews.length > 0 ? (
        <MemberReviewRows reviews={reviews} />
      ) : (
        <ProfileEmpty className="mt-4">No reviews yet.</ProfileEmpty>
      )}
    </DetailSection>
  );
}
