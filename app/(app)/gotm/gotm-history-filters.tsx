import Form from "next/form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  GOTM_HISTORY_PATH,
  GOTM_KIND_OPTIONS,
  GOTM_SORT_OPTIONS,
  hasActiveGotmFilters,
  type GotmHistoryFilters as Filters,
} from "@/lib/api/gotm-rounds";

const selectClass =
  "h-8 rounded-lg border border-input bg-background px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

// GET filter form for the archive. Submitting drops `page`, so a new filter
// starts from the first page. The fields are uncontrolled, so the caller keys
// this on the current URL to re-sync them after back/forward or a link.
export function GotmHistoryFilters({
  filters,
  years,
}: {
  filters: Filters;
  years: number[];
}) {
  // Keep a year from the URL selectable even when the list doesn't carry it.
  const yearOptions =
    filters.year && !years.includes(filters.year)
      ? [filters.year, ...years]
      : years;

  return (
    <Form
      action={GOTM_HISTORY_PATH}
      className="flex flex-wrap items-end gap-2"
      role="search"
    >
      <select
        name="kind"
        defaultValue={filters.kind}
        aria-label="Kind"
        className={selectClass}
      >
        {GOTM_KIND_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <select
        name="year"
        defaultValue={filters.year ? String(filters.year) : ""}
        aria-label="Year"
        className={selectClass}
      >
        <option value="">All years</option>
        {yearOptions.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
      <Input
        type="search"
        name="q"
        defaultValue={filters.q}
        placeholder="Search titles…"
        aria-label="Search titles"
        className="w-48"
      />
      <select
        name="sort"
        defaultValue={filters.sort}
        aria-label="Sort"
        className={selectClass}
      >
        {GOTM_SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <Button type="submit" variant="outline" size="sm">
        Apply
      </Button>
      {hasActiveGotmFilters(filters) && (
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={<Link href={GOTM_HISTORY_PATH} />}
        >
          Reset
        </Button>
      )}
    </Form>
  );
}
