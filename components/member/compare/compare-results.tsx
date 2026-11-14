import type { Platform } from "@/lib/api/types";
import { compareHref, type CompareFilters } from "@/lib/completions-compare";
import type { CompareResult, CompletionOverlap } from "@/lib/members/compare-page";
import { ListPagination } from "@/components/list-pagination";
import { MemberListEmpty } from "@/components/member/member-game-card";
import { CompareCompletionRow } from "@/components/member/compare/compare-completion-row";
import { CompareFiltersForm } from "@/components/member/compare/compare-filters-form";
import { CompareOverlap } from "@/components/member/compare/compare-overlap";

type Side = { id: string; name: string };

// A comparison: the overlap diagram, the shared games' filters, then the
// contact sheet of shared games a page at a time.
export function CompareResults({
  result,
  overlap,
  filters,
  platforms,
  action,
  left,
  right,
}: {
  result: Extract<CompareResult, { kind: "ok" }>;
  overlap: CompletionOverlap | null;
  filters: CompareFilters;
  platforms: Platform[];
  action: string;
  left: Side;
  right: Side;
}) {
  const filtered = Boolean(filters.year || filters.platform || filters.q);
  return (
    <>
      {overlap && <CompareOverlap overlap={overlap} left={left} right={right} filtered={filtered} />}

      <CompareFiltersForm
        // Remount on navigation so the uncontrolled fields pick up the new
        // URL (e.g. after "Clear").
        key={compareHref(left.id, filters, 1)}
        action={action}
        filters={filters}
        platforms={platforms}
        heading={
          filtered
            ? `${result.total} shared ${result.total === 1 ? "game matches" : "games match"}`
            : `The ${result.total} in common`
        }
      />

      {result.rows.length === 0 ? (
        <MemberListEmpty>
          {filtered
            ? "No shared completions matched those filters."
            : `${left.name} and ${right.name} haven't completed any of the same games yet.`}
        </MemberListEmpty>
      ) : (
        <ul className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4 lg:grid-cols-6">
          {result.rows.map((row) => (
            <CompareCompletionRow key={row.gamedb_game_id} row={row} left={left} right={right} />
          ))}
        </ul>
      )}
      <ListPagination
        currentPage={filters.page}
        totalPages={result.totalPages}
        buildHref={(p) => compareHref(left.id, filters, p)}
      />
    </>
  );
}
