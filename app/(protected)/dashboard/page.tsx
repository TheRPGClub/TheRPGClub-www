import { Suspense } from "react";
import { fetchDashboardPanels } from "@/lib/api/dashboard-panels";
import { memberPanels, type PanelViewer } from "@/lib/dashboard/panels";
import { loadDashboard } from "@/lib/dashboard/issue";
import { discordAvatarUrl, getFeatures, getSession } from "@/lib/session";
import type { FeatureView } from "@/lib/features";
import { DashboardIssueView } from "@/components/dashboard/dashboard-issue";
import { NoVoting } from "@/components/dashboard/dashboard-notes";
import { DashboardSkeleton, PanelsSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { AroundTheClub } from "@/components/dashboard/panels/around-the-club";

// The dashboard is the member's homepage (spec api#421): the current issue
// (lib/dashboard/issue), all Voting & GOTM's, then the member's Dashboard
// Panels in their order. The issue and the panels load in their own Suspense
// boundaries, so a slow panel list never holds the cover (nor the cover the
// panels). With Voting & GOTM hidden from the viewer the panels take the
// issue's place; with no panels either, the page says why it is empty.

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
  const features = await getFeatures();
  const viewer: PanelViewer = {
    id: principal.discord_id,
    name: principal.global_name ?? principal.username,
    avatarUrl: discordAvatarUrl(principal.discord_id, principal.avatar, 64),
  };
  const voting = features.shown("voting_gotm");

  return (
    <div className="space-y-10">
      {voting && (
        <Suspense fallback={<DashboardSkeleton />}>
          <Issue features={features} viewerId={principal.id} />
        </Suspense>
      )}
      <Suspense fallback={voting ? <PanelsSkeleton /> : <DashboardSkeleton />}>
        <Panels features={features} viewer={viewer} noIssue={!voting} />
      </Suspense>
    </div>
  );
}

async function Issue({ features, viewerId }: { features: FeatureView; viewerId: string }) {
  const issue = await loadDashboard(features);
  return <DashboardIssueView issue={issue} viewerId={viewerId} />;
}

// The member's panels. One tree whatever the count: switching the first
// panel on (or the last off) must not remount the board mid-edit, so the
// "no Voting" note sits beside it rather than wrapping it.
async function Panels({ features, viewer, noIssue }: { features: FeatureView; viewer: PanelViewer; noIssue: boolean }) {
  const saved = await fetchDashboardPanels(viewer.id);
  const panels = memberPanels(saved?.panels ?? null, features);
  return (
    <div className="space-y-10 empty:hidden">
      {noIssue && panels.length === 0 && <NoVoting />}
      <AroundTheClub
        key="around-the-club"
        panels={panels}
        apiList={saved?.panels ?? panels}
        catalogue={saved?.catalogue ?? []}
        customised={saved?.customised === true}
        features={features}
        viewer={viewer}
      />
    </div>
  );
}
