import { fetchFeedbackList } from "@/lib/api/feedback";
import { requireAuth } from "@/lib/session";
import { canUseTier, staffSection } from "@/lib/staff";
import { StaffOnly } from "@/components/staff-only";
import { FeedbackReviewQueue } from "@/components/feedback/review-queue";

const SECTION = staffSection("feedback");

// The Superadmin review queue: every Pending Feedback, most upvoted first.
// Approving opens a GitHub issue in the chosen repo; rejecting needs a
// reason. The bot announces either to the author. (The review desk proper is
// www#227.)
export default async function FeedbackReviewPage() {
  const session = await requireAuth();
  if (!canUseTier(session.membership, SECTION.tier)) {
    return <StaffOnly title={SECTION.label} tier={SECTION.tier} />;
  }

  const queue = await fetchFeedbackList({ statuses: ["pending"] });
  const reviewerName =
    session.principal.global_name ?? session.principal.username;
  return <FeedbackReviewQueue section={SECTION} queue={queue} reviewerName={reviewerName} />;
}
