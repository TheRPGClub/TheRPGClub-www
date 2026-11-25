import { Suspense } from "react";
import { requireAuth, requireFeature } from "@/lib/session";
import {
  parseFeedFilters,
  type AchievementFeedFilters as Filters,
} from "@/lib/api/achievement-feed";
import { linkedAccountsEditHref } from "@/lib/achievements";
import { fetchHubFeed } from "@/lib/achievements/hub-feed";
import { PreviewBadge } from "@/components/feature/preview-badge";
import { HubPage } from "@/components/achievements/hub/hub-page";
import { HubSkeleton } from "@/components/achievements/hub/hub-skeleton";

// The community hub (`?provider=`, `?page=`).

export default async function AchievementsHubPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = parseFeedFilters(await searchParams);

  return (
    <Suspense fallback={<HubSkeleton />}>
      <AchievementsHub filters={filters} />
    </Suspense>
  );
}

async function AchievementsHub({ filters }: { filters: Filters }) {
  // The feed needs auth; confirm a session before a fetch that can only 401.
  // The read doesn't need the session, so it starts alongside the gate.
  const [session, features, feed] = await Promise.all([
    requireAuth(),
    requireFeature("achievement_hub"),
    fetchHubFeed(filters),
  ]);

  return (
    <HubPage
      filters={filters}
      feed={feed}
      badge={features.preview("achievement_hub") && <PreviewBadge />}
      editHref={linkedAccountsEditHref(session.principal.discord_id)}
    />
  );
}
