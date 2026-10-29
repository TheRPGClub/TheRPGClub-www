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
import { GotmRoundBlock } from "@/components/gotm-round-block";
import { ListPagination } from "@/components/list-pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { GotmHistoryFilters } from "./gotm-history-filters";

export default async function GotmHistoryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = parseGotmHistoryFilters(await searchParams);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">GOTM history</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every Game of the Month and Non-RPG Game of the Month, round by round.
        </p>
      </div>

      <Suspense fallback={<GotmHistorySkeleton />}>
        <GotmHistory filters={filters} />
      </Suspense>
    </div>
  );
}

async function GotmHistory({ filters }: { filters: Filters }) {
  // The archive read is cached by URL and needs auth, so confirm a session
  // first; see lib/api/gotm-rounds.ts. getSession is memoised per request.
  if (!(await getSession())) redirect("/");

  const result = await fetchGotmRounds(filters);
  const rounds = result?.rounds ?? [];
  const { total, totalPages } = paginationOf(result?.meta ?? undefined, rounds.length);
  const showGotm = filters.kind !== "nr_gotm";
  const showNr = filters.kind !== "gotm";

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <GotmHistoryFilters
          // Uncontrolled fields: remount when the URL changes so they re-sync.
          key={gotmHistoryHref(filters)}
          filters={filters}
          years={result?.meta?.years ?? []}
        />
        {result && total > 0 && (
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {total} {total === 1 ? "round" : "rounds"}
          </p>
        )}
      </div>

      {!result ? (
        <EmptyState>Couldn&apos;t load GOTM history. Try again later.</EmptyState>
      ) : rounds.length === 0 ? (
        <EmptyState>
          {hasActiveGotmFilters(filters)
            ? "No rounds match those filters."
            : "No GOTM rounds yet."}
        </EmptyState>
      ) : (
        <div className="space-y-12">
          {rounds.map((round) => (
            <div key={round.round_number} className="space-y-8">
              {showGotm && round.gotm && (
                <GotmRoundBlock
                  kind="gotm"
                  roundNumber={round.round_number}
                  block={round.gotm}
                />
              )}
              {showNr && round.nr_gotm && (
                <GotmRoundBlock
                  kind="nr_gotm"
                  roundNumber={round.round_number}
                  block={round.nr_gotm}
                />
              )}
            </div>
          ))}
        </div>
      )}

      <ListPagination
        currentPage={filters.page}
        totalPages={totalPages}
        buildHref={(page) => gotmHistoryHref(filters, page)}
      />
    </>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
      {children}
    </p>
  );
}

function GotmHistorySkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-8 w-28" />
      </div>
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-8 w-72" />
          <Skeleton className="h-56 w-full rounded-xl" />
        </div>
      ))}
    </div>
  );
}
