import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession, requireFeature } from "@/lib/session";
import {
  fetchGotmRounds,
  parseGotmHistoryFilters,
  type GotmHistoryFilters as Filters,
} from "@/lib/api/gotm-rounds";
import { PreviewBadge } from "@/components/feature/preview-badge";
import { GotmHistory } from "@/components/gotm/gotm-history";
import { GotmHistorySkeleton } from "@/components/gotm/gotm-history-skeleton";

// The GOTM history: every round's winners, filtered by the URL.
export default async function GotmHistoryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = parseGotmHistoryFilters(await searchParams);

  return (
    <Suspense fallback={<GotmHistorySkeleton />}>
      <GotmHistoryContent filters={filters} />
    </Suspense>
  );
}

async function GotmHistoryContent({ filters }: { filters: Filters }) {
  // The archive read needs auth, so confirm a session first rather than make
  // an unauthenticated fetch that can only 401; see lib/api/gotm-rounds.ts.
  // getSession is memoised per request.
  if (!(await getSession())) redirect("/");
  const features = await requireFeature("voting_gotm");
  const result = await fetchGotmRounds(filters);

  return (
    <GotmHistory
      filters={filters}
      result={result}
      badge={features.preview("voting_gotm") && <PreviewBadge />}
    />
  );
}
