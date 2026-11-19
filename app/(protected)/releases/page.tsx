import { Suspense } from "react";
import { requireFeature } from "@/lib/session";
import { utcToday } from "@/lib/releases";
import { parseCalendarFilters } from "@/lib/release-calendar";
import type { RawSearchParams } from "@/lib/search-params";
import { PreviewBadge } from "@/components/feature/preview-badge";
import { ReleasesBody } from "@/components/releases/releases-body";
import { ReleasesSkeleton } from "@/components/releases/releases-skeleton";

// The Release Calendar (spec api#389, www#114): a month grid with its Day
// TBA band on top, then every other Upcoming Release from today on, listed
// by month, quarter, year and TBA. The address holds the grid's month and
// the platform filter, which narrows the grid and the list together.

export default async function ReleasesPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  // Gate here, before the body's Suspense boundary. The section's layout
  // answers the 404 on a full load; this catches a flag turned off since,
  // on a soft navigation (see requireFeature).
  const features = await requireFeature("release_calendar");
  const today = utcToday();
  const filters = parseCalendarFilters(await searchParams, today);
  const badge = features.preview("release_calendar") && <PreviewBadge />;

  return (
    <Suspense fallback={<ReleasesSkeleton badge={badge} />}>
      <ReleasesBody filters={filters} today={today} badge={badge} />
    </Suspense>
  );
}
