import type { ReactNode } from "react";
import {
  gotmHistoryHref,
  hasActiveGotmFilters,
  type GotmHistoryFilters as Filters,
  type GotmRoundsPage,
} from "@/lib/api/gotm-rounds";
import { paginationOf } from "@/lib/api/pagination";
import { groupByYear } from "@/components/issue/gotm-shared";
import { ListPagination } from "@/components/list-pagination";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/templates/page-header";
import { GotmDiptychRow } from "./gotm-diptych-row";
import { GotmHistoryFilters } from "./gotm-history-filters";
import { GotmYearRail } from "./gotm-year-rail";

// The GOTM History: every closed round as its winners' art under the round
// numeral, newest first, each opening its Round Page. The Category switch sits by
// the title and the year rail beside the rows.
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
  // The newest round leads the roll, only where the roll starts.
  const leadsWithNewest = filters.page === 1 && filters.sort === "desc" && !filters.year;

  return (
    <div className="space-y-5">
      <PageHeader
        title="GOTM history"
        badge={badge}
        count={result && total > 0 ? `${total} ${total === 1 ? "round" : "rounds"}` : undefined}
        actions={
          <div className="hidden sm:block">
            <GotmHistoryFilters filters={filters} />
          </div>
        }
      />
      {/* A phone sets the switch full width under the title, out of the
          header's right-aligned actions slot. */}
      <div data-slot="gotm-filters-row" className="sm:hidden">
        <GotmHistoryFilters filters={filters} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[4.5rem_minmax(0,1fr)] lg:gap-6">
        <GotmYearRail filters={filters} years={result?.meta?.years ?? []} />

        {/* Column 2 even when the rail has nothing to show. */}
        <div className="min-w-0 space-y-6 lg:col-start-2">
          {!result ? (
            <EmptyState>Couldn&apos;t load the GOTM history. Try again in a moment.</EmptyState>
          ) : rounds.length === 0 ? (
            <EmptyState>
              {hasActiveGotmFilters(filters) ? "No rounds match those filters." : "No GOTM rounds yet."}
            </EmptyState>
          ) : (
            <div className="space-y-4.5 sm:space-y-3.5">
              {groupByYear(rounds).map((group, gi) => (
                <section
                  data-slot="gotm-year"
                  key={`${group.year ?? "undated"}-${gi}`}
                  aria-label={group.year ? String(group.year) : "Undated rounds"}
                  className="space-y-4.5 sm:space-y-3.5"
                >
                  <h2
                    className={cn(
                      "font-headline flex items-center gap-4 text-[1.875rem] leading-none text-faint-foreground after:h-0.5 after:flex-1 after:bg-border",
                      gi > 0 && "pt-2.5",
                    )}
                  >
                    {group.year ?? "Undated"}
                  </h2>
                  <ol className="space-y-6 sm:space-y-6.5">
                    {group.rounds.map((round, ri) => (
                      <GotmDiptychRow
                        key={round.round_number}
                        round={round}
                        filters={filters}
                        lead={leadsWithNewest && gi === 0 && ri === 0}
                      />
                    ))}
                  </ol>
                </section>
              ))}
            </div>
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
    <p data-slot="issue-note" className="rounded-md border border-dashed border-border-strong px-4 py-12 text-center text-dim-foreground">
      {children}
    </p>
  );
}
