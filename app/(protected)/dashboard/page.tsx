import { Suspense } from "react";
import { loadDashboard } from "@/lib/dashboard/issue";
import { getFeatures, getSession } from "@/lib/session";
import { DashboardIssueView } from "@/components/dashboard/dashboard-issue";
import { NoVoting } from "@/components/dashboard/dashboard-notes";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";

// The dashboard is the current issue (lib/dashboard/issue). It is all Voting
// & GOTM's: with that Feature hidden from the viewer the page says so
// instead. Each winner's numbers follow their own Features.

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}

async function DashboardContent() {
  // Session first: every read below needs auth, so a logged-out render skips
  // them instead of wasting fetches that can only 401.
  const session = await getSession();
  if (!session) return null;
  const features = await getFeatures();
  if (!features.shown("voting_gotm")) return <NoVoting />;

  const issue = await loadDashboard(features);
  return <DashboardIssueView issue={issue} viewerId={session.principal.id} />;
}
