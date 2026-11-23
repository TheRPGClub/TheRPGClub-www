import Link from "next/link";
import type { SuggestionList } from "@/lib/api/suggestions";
import { STAFF_DESK_BACK, type StaffSection } from "@/lib/staff";
import { PageHeader } from "@/components/templates/page-header";
import { ReviewCard } from "@/components/suggestions/review-card";

// The Superadmin review queue (null when it couldn't be read): every Pending
// Suggestion, most upvoted first, each a ReviewCard signed by the reviewer.
export function SuggestionReviewQueue({
  section,
  queue,
  reviewerName,
}: {
  section: StaffSection;
  queue: SuggestionList | null;
  reviewerName: string;
}) {
  return (
    <div className="space-y-6">
      <PageHeader
        back={STAFF_DESK_BACK}
        title={section.label}
        description={section.blurb}
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
