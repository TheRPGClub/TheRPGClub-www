import { requireAuth } from "@/lib/session";
import { featureView } from "@/lib/features";
import { fetchCurrentPhase } from "@/lib/api/voting-round";
import { AppShell } from "@/components/shell/app-shell";

export default async function AppLayout({
  children,
  crumbs,
}: {
  children: React.ReactNode;
  // The @crumbs slot: the current route's trail for the top bar.
  crumbs: React.ReactNode;
}) {
  // An expired or revoked session goes back through sign-in to this page.
  const session = await requireAuth();

  // Sequenced behind the redirect, not run alongside getSession.
  //
  // voting_rounds/current requires auth and 401s without it. Next's Data
  // Cache key includes the request headers (and so the member's
  // Authorization), so cached reads are per member and a 401 is never shared;
  // waiting for the session only keeps a logged-out render from wasting a
  // fetch that can only fail.
  //
  // Voting & GOTM hidden from this viewer: no round to name the nav item by.
  const features = featureView(session.features);
  const votingPhase = features.shown("voting_gotm")
    ? await fetchCurrentPhase()
    : null;

  return (
    <AppShell
      principal={session.principal}
      membership={session.membership}
      votingPhase={votingPhase}
      features={session.features}
      search={features.canOpen("game_index")}
      crumbs={crumbs}
    >
      {children}
    </AppShell>
  );
}
