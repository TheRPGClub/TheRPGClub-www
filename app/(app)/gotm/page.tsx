import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import {
  fetchGotmRounds,
  gotmHistoryHref,
  hasActiveGotmFilters,
  parseGotmHistoryFilters,
  type GotmHistoryFilters as Filters,
} from "@/lib/api/gotm-rounds";
import { paginationOf } from "@/lib/api/pagination";
import { GotmCoverWall } from "@/components/issue/gotm-cover-wall";
import { GotmLedger } from "@/components/issue/gotm-ledger";
import { GotmRail } from "@/components/issue/gotm-rail";
import { PageHeader } from "@/components/issue/page-header";
import { ListPagination } from "@/components/list-pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { GotmHistoryFilters } from "./gotm-history-filters";

// Every Game of the Month and Non-RPG Game of the Month, round by round.
// With both tracks it reads as a ledger: each round's number beside its GOTM
// and NR-GOTM art. Narrowed to one track, every round gets its own cover. The
// rail picks the track and the year in either mode.

export default async function GotmHistoryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = parseGotmHistoryFilters(await searchParams);

  return (
    <Suspense fallback={<GotmHistorySkeleton />}>
      <GotmHistory filters={filters} />
    </Suspense>
  );
}

async function GotmHistory({ filters }: { filters: Filters }) {
  // The archive read needs auth, so confirm a session first rather than make
  // an unauthenticated fetch that can only 401; see lib/api/gotm-rounds.ts.
  // getSession is memoised per request.
  if (!(await getSession())) redirect("/");

  const result = await fetchGotmRounds(filters);
  const rounds = result?.rounds ?? [];
  const { total, totalPages } = paginationOf(
    result?.meta ?? undefined,
    rounds.length,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="GOTM history"
        count={
          result && total > 0
            ? `${total} ${total === 1 ? "round" : "rounds"}`
            : undefined
        }
        actions={
          <GotmHistoryFilters
            // Uncontrolled fields: remount when the URL changes so they re-sync.
            key={gotmHistoryHref(filters)}
            filters={filters}
          />
        }
      />

      <div className="grid gap-6 lg:grid-cols-[13.5rem_minmax(0,1fr)] lg:gap-7 xl:grid-cols-[15rem_minmax(0,1fr)]">
        <GotmRail filters={filters} years={result?.meta?.years ?? []} />

        <div className="min-w-0 space-y-6">
          {!result ? (
            <EmptyState>
              Couldn&apos;t load the GOTM history. Try again in a moment.
            </EmptyState>
          ) : rounds.length === 0 ? (
            <EmptyState>
              {hasActiveGotmFilters(filters)
                ? "No rounds match those filters."
                : "No GOTM rounds yet."}
            </EmptyState>
          ) : filters.kind === "both" ? (
            <GotmLedger rounds={rounds} searching={!!filters.q} />
          ) : (
            <GotmCoverWall kind={filters.kind} rounds={rounds} />
          )}

          <ListPagination
            currentPage={filters.page}
            totalPages={totalPages}
            buildHref={(page) => gotmHistoryHref(filters, page)}
          />
        </div>
      </div>
    </div>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-md border border-dashed border-rule-strong px-4 py-12 text-center text-paper-dim">
      {children}
    </p>
  );
}

function GotmHistorySkeleton() {
  return (
    <div className="space-y-6">
      <PageHeader title="GOTM history" />
      <div className="grid gap-6 lg:grid-cols-[13.5rem_minmax(0,1fr)] lg:gap-7 xl:grid-cols-[15rem_minmax(0,1fr)]">
        <div className="space-y-2">
          <Skeleton className="h-9.5 w-full rounded-sm" />
          <Skeleton className="h-9.5 w-full rounded-sm" />
          <Skeleton className="h-9.5 w-full rounded-sm" />
        </div>
        <div className="space-y-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="grid gap-4 xl:grid-cols-[8.5rem_minmax(0,1.6fr)_minmax(0,1fr)]"
            >
              <Skeleton className="h-20 w-28 rounded-sm" />
              <Skeleton className="h-49 rounded-sm" />
              <Skeleton className="h-49 rounded-sm" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
