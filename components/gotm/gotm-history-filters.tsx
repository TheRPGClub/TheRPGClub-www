import Form from "next/form";
import { Search } from "lucide-react";
import {
  GOTM_HISTORY_PATH,
  GOTM_SORT_OPTIONS,
  type GotmHistoryFilters as Filters,
} from "@/lib/api/gotm-rounds";
import { SubmitOnChangeSelect } from "./submit-on-change-select";

// The archive's title search and sort, a GET form beside the page title. The
// track and year come from the side rail, so they ride along as hidden
// fields. Submitting drops `page`, so a new search starts from the first
// page; changing the sort submits straight away. The fields are
// uncontrolled, so the caller keys this on the current URL to re-sync them
// after back/forward or a link.
export function GotmHistoryFilters({ filters }: { filters: Filters }) {
  return (
    <Form
      action={GOTM_HISTORY_PATH}
      role="search"
      className="flex w-full flex-wrap items-center gap-2 sm:w-auto"
    >
      {filters.kind !== "both" && (
        <input type="hidden" name="kind" value={filters.kind} />
      )}
      {filters.year && (
        <input type="hidden" name="year" value={filters.year} />
      )}
      <div className="flex h-9.5 min-w-0 flex-1 basis-full items-center gap-2 rounded-sm border border-border-strong bg-card px-3 text-faint-foreground transition-colors focus-within:border-faint-foreground sm:w-72 sm:flex-none sm:basis-auto">
        <Search aria-hidden className="size-4 shrink-0" />
        <input
          type="search"
          name="q"
          defaultValue={filters.q}
          placeholder="Search titles…"
          aria-label="Search titles"
          className="h-full min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-faint-foreground"
        />
      </div>
      <SubmitOnChangeSelect
        name="sort"
        defaultValue={filters.sort}
        aria-label="Sort"
        options={GOTM_SORT_OPTIONS}
        className="font-label h-9.5 rounded-sm border border-border-strong bg-card px-2.5 text-[0.92rem] font-bold tracking-[0.05em] text-foreground outline-none focus-visible:border-faint-foreground"
      />
      {/* Enter submits the search; the button is there for anyone who
          doesn't reach for it. */}
      <button
        type="submit"
        className="font-label h-9.5 rounded-sm border border-border-strong px-3 text-[0.92rem] font-extrabold tracking-[0.05em] text-foreground transition-colors hover:border-faint-foreground hover:bg-muted"
      >
        Search
      </button>
    </Form>
  );
}
