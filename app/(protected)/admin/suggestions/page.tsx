import { fetchSuggestions } from "@/lib/api/suggestions";
import { requireAuth } from "@/lib/session";
import { canUseTier, staffSection } from "@/lib/staff";
import { StaffOnly } from "@/components/staff-only";
import { SuggestionReviewQueue } from "@/components/suggestions/review-queue";

const SECTION = staffSection("suggestions");

// The Superadmin review queue: every Pending Suggestion, most upvoted first,
// as the board shows them. Approving opens a GitHub issue in the chosen repo;
// rejecting needs a reason. The bot announces either to the author.
export default async function SuggestionReviewPage() {
  const session = await requireAuth();
  if (!canUseTier(session.membership, SECTION.tier)) {
    return <StaffOnly title={SECTION.label} tier={SECTION.tier} />;
  }

  const queue = await fetchSuggestions(["pending"]);
  const reviewerName =
    session.principal.global_name ?? session.principal.username;
  return <SuggestionReviewQueue section={SECTION} queue={queue} reviewerName={reviewerName} />;
}
