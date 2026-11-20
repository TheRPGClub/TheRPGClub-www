import { Suspense } from "react";
import { fetchDashboardPanels } from "@/lib/api/dashboard-panels";
import { memberPanels, type PanelViewer } from "@/lib/dashboard/panels";
import { loadDashboard } from "@/lib/dashboard/issue";
import { discordAvatarUrl, getFeatures, getSession } from "@/lib/session";
import type { FeatureView } from "@/lib/features";
import { DashboardIssueView } from "@/components/dashboard/dashboard-issue";
import { NoVoting } from "@/components/dashboard/dashboard-notes";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { AroundTheClub } from "@/components/dashboard/panels/around-the-club";

// The dashboard is the member's homepage (spec api#421): the current issue
// (lib/dashboard/issue), all Voting & GOTM's, then the member's Dashboard
// Panels in their order. The issue and each panel load on their own, so
// neither holds the other. With Voting & GOTM hidden from the viewer the
// panels take the issue's place; with no panels either, the page says why
// it is empty.

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
  const { principal } = session;
  const [features, saved] = await Promise.all([getFeatures(), fetchDashboardPanels(principal.discord_id)]);
  const panels = memberPanels(saved?.panels ?? null, features);
  const viewer: PanelViewer = {
    id: principal.discord_id,
    name: principal.global_name ?? principal.username,
    avatarUrl: discordAvatarUrl(principal.discord_id, principal.avatar, 64),
  };

  if (!features.shown("voting_gotm")) {
    return panels.length > 0 ? <AroundTheClub panels={panels} viewer={viewer} /> : <NoVoting />;
  }
  return (
    <div className="space-y-10">
      <Suspense fallback={<DashboardSkeleton />}>
        <Issue features={features} viewerId={principal.id} />
      </Suspense>
      <AroundTheClub panels={panels} viewer={viewer} />
    </div>
  );
}

async function Issue({ features, viewerId }: { features: FeatureView; viewerId: string }) {
  const issue = await loadDashboard(features);
  return <DashboardIssueView issue={issue} viewerId={viewerId} />;
}
