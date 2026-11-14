import Form from "next/form";
import { Search } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

// Search the member's completed games, across every year. A GET form:
// next/form keeps it client-side.
export function CompletedSearch({
  action,
  q,
  displayName,
}: {
  action: string;
  q: string;
  displayName: string;
}) {
  return (
    <Form action={action} role="search" className="w-full max-w-80">
      {/* The group pads its field after an addon; here the gap spaces them. */}
      <InputGroup
        variant="list-search"
        className="h-10 gap-2 px-3 has-[>[data-align=inline-start]]:[&>input]:pl-0"
      >
        <InputGroupAddon className="p-0">
          <Search aria-hidden className="size-4 shrink-0" />
        </InputGroupAddon>
        <label htmlFor="completed-search" className="sr-only">
          Search {displayName}&apos;s completed games
        </label>
        <InputGroupInput
          id="completed-search"
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Search completed games"
          className="h-full p-0 text-sm md:text-sm"
        />
      </InputGroup>
      {/* A search spans every year. */}
      {/* eslint-disable-next-line structure/no-raw-controls -- a hidden form value, not a control */}
      <input type="hidden" name="year" value="all" />
    </Form>
  );
}
