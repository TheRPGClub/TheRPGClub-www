import Form from "next/form";
import { Search } from "lucide-react";
import {
  GOTM_HISTORY_PATH,
  GOTM_SORT_OPTIONS,
  type GotmHistoryFilters as Filters,
} from "@/lib/api/gotm-rounds";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
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
      {filters.kind !== "both" && <Input type="hidden" name="kind" value={filters.kind} />}
      {filters.year && <Input type="hidden" name="year" value={filters.year} />}
      {/* The group pads its field after an addon; here the gap spaces them. */}
      <InputGroup
        variant="search"
        className="h-9.5 min-w-0 flex-1 basis-full gap-2 px-3 has-[>[data-align=inline-start]]:[&>input]:pl-0 sm:w-72 sm:flex-none sm:basis-auto"
      >
        <InputGroupAddon className="p-0">
          <Search aria-hidden className="size-4 shrink-0" />
        </InputGroupAddon>
        <InputGroupInput
          type="search"
          name="q"
          defaultValue={filters.q}
          placeholder="Search titles…"
          aria-label="Search titles"
          className="h-full p-0 text-sm md:text-sm"
        />
      </InputGroup>
      <SubmitOnChangeSelect
        name="sort"
        defaultValue={filters.sort}
        aria-label="Sort"
        options={GOTM_SORT_OPTIONS}
        className="px-2.5 text-[0.92rem] data-[size=default]:h-9.5"
      />
      {/* Enter submits the search; the button is there for anyone who
          doesn't reach for it. */}
      <Button type="submit" variant="search" className="h-9.5 px-3 text-[0.92rem]">
        Search
      </Button>
    </Form>
  );
}
