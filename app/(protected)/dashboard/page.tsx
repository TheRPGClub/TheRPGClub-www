import { Suspense } from "react";
import { fetchUpcomingBirthdays } from "@/lib/api/birthdays";
import { birthdayLine } from "@/lib/dashboard/birthdays";
import { loadDashboard } from "@/lib/dashboard/issue";
import { clubToday } from "@/lib/challenges/dates";
import { getFeatures, getSession } from "@/lib/session";
import { DashboardIssueView } from "@/components/dashboard/dashboard-issue";
import { NoVoting } from "@/components/dashboard/dashboard-notes";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { UpcomingBirthdays } from "@/components/dashboard/upcoming-birthdays";

// The dashboard is the current issue (lib/dashboard/issue). It is all Voting
// & GOTM's: with that Feature hidden from the viewer the page says so
// instead. Each winner's numbers follow their own Features. Upcoming
// Birthdays belong to no Feature, so their line shows on either page,
// unless nobody's Birthday is coming up.

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
  const voting = features.shown("voting_gotm");

  const [issue, upcoming] = await Promise.all([
    voting ? loadDashboard(features) : null,
    fetchUpcomingBirthdays(),
  ]);
  const entries = birthdayLine(upcoming, clubToday());
  const birthdays = entries && <UpcomingBirthdays entries={entries} />;

  if (!issue) return <NoVoting birthdays={birthdays} />;
  return <DashboardIssueView issue={issue} viewerId={session.principal.id} birthdays={birthdays} />;
}
