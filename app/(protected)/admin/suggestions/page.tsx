import Link from "next/link";
import { fetchSuggestions } from "@/lib/api/suggestions";
import { requireAuth } from "@/lib/session";
import { canUseTier, staffSection } from "@/lib/staff";
import { PageHeader } from "@/components/templates/page-header";
import { StaffOnly } from "@/components/staff-only";
import { ReviewCard } from "@/components/suggestions/review-card";

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

  return (
    <div className="space-y-6">
      <PageHeader
        title={SECTION.label}
        description={SECTION.blurb}
        count={queue ? `${queue.total} pending` : undefined}
      />
      <p className="text-sm text-faint-foreground">
        Most upvoted first. Reviewed cards stay here until you refresh; past
        decisions are on the{" "}
        <Link
          href="/suggestions"
          className="text-foreground underline decoration-gotm decoration-2 underline-offset-4 hover:text-highlight"
        >
          Suggestion Board
        </Link>
        .
      </p>

      {queue === null ? (
        <p role="alert" className="text-destructive">
          {"Couldn't load the Suggestions. Refresh to try again."}
        </p>
      ) : queue.rows.length === 0 ? (
        <p className="rounded-md border border-dashed border-border-strong px-4 py-6 text-faint-foreground">
          Nothing waiting for review.
        </p>
      ) : (
        <ul className="grid items-start gap-x-6 gap-y-7 lg:grid-cols-2">
          {queue.rows.map((s) => (
            <li key={s.suggestion_id}>
              <ReviewCard suggestion={s} reviewerName={reviewerName} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
