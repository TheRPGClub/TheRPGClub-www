import { fetchFeedbackList } from "@/lib/api/feedback";
import { requireAuth } from "@/lib/session";
import { canUseTier, staffSection } from "@/lib/staff";
import { StaffOnly } from "@/components/staff-only";
import { FeedbackDesk } from "@/components/feedback/desk";

const SECTION = staffSection("feedback");

// The Superadmin review desk (www#227): every Pending Feedback in three kind
// lanes, reviewed in a side Sheet (change its kind, approve it into a repo,
// reject it with a reason or mark it a Duplicate).
export default async function FeedbackReviewPage() {
  const session = await requireAuth();
  if (!canUseTier(session.membership, SECTION.tier)) {
    return <StaffOnly title={SECTION.label} tier={SECTION.tier} />;
  }

  const queue = await fetchFeedbackList({ statuses: ["pending"] });
  return <FeedbackDesk rows={queue?.rows ?? null} />;
}
