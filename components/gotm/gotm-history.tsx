import type { ReactNode } from "react";
import {
  gotmHistoryHref,
  hasActiveGotmFilters,
  type GotmHistoryFilters as Filters,
  type GotmRoundsPage,
} from "@/lib/api/gotm-rounds";
import { paginationOf } from "@/lib/api/pagination";
import { GotmCoverWall } from "@/components/issue/gotm-cover-wall";
import { GotmLedger } from "@/components/issue/gotm-ledger";
import { GotmRail } from "@/components/issue/gotm-rail";
import { ListPagination } from "@/components/list-pagination";
import { PageHeader } from "@/components/templates/page-header";
import { GotmHistoryFilters } from "./gotm-history-filters";

// Every Game of the Month and Non-RPG Game of the Month, round by round.
// With both tracks it reads as a ledger: each round's number beside its GOTM
// and NR-GOTM art. Narrowed to one track, every round gets its own cover. The
// rail picks the track and the year in either mode.
export function GotmHistory({
  filters,
  result,
  badge,
}: {
  filters: Filters;
  // null when the archive couldn't be read.
  result: GotmRoundsPage | null;
  badge: ReactNode;
}) {
  const rounds = result?.rounds ?? [];
  const { total, totalPages } = paginationOf(result?.meta ?? undefined, rounds.length);

  return (
    <div className="space-y-6">
      <PageHeader
        title="GOTM history"
        badge={badge}
        count={result && total > 0 ? `${total} ${total === 1 ? "round" : "rounds"}` : undefined}
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
            <EmptyState>Couldn&apos;t load the GOTM history. Try again in a moment.</EmptyState>
          ) : rounds.length === 0 ? (
            <EmptyState>
              {hasActiveGotmFilters(filters) ? "No rounds match those filters." : "No GOTM rounds yet."}
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

function EmptyState({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-md border border-dashed border-border-strong px-4 py-12 text-center text-dim-foreground">
      {children}
    </p>
  );
}
