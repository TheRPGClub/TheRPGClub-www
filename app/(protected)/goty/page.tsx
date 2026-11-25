import { Suspense } from "react";
import { getSession, requireFeature } from "@/lib/session";
import { loadGotyPage } from "@/lib/goty/load";
import { PreviewBadge } from "@/components/feature/preview-badge";
import { RouteSkeleton } from "@/components/templates/route-skeleton";
import { GotyPage } from "@/components/goty/goty-page";

export const metadata = { title: "GOTY Vote" };

// The yearly GOTY Vote (spec api#471): the current year by phase, then
// every decided year's winners.
export default function GotyRoute() {
  return (
    <Suspense fallback={<RouteSkeleton />}>
      <GotyContent />
    </Suspense>
  );
}

async function GotyContent() {
  const [features, data, session] = await Promise.all([
    requireFeature("goty_vote"),
    loadGotyPage(),
    getSession(),
  ]);
  const badge = features.preview("goty_vote") ? <PreviewBadge /> : null;
  return <GotyPage data={data} viewerId={session?.principal.id} badge={badge} />;
}
