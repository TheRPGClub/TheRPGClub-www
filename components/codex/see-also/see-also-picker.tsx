"use client";

import { useId, useState, type KeyboardEvent } from "react";
import { Search } from "lucide-react";
import type { DeskLinks } from "@/hooks/use-desk-links";
import { useCodexEntrySearch } from "@/hooks/use-codex-entry-search";
import { LINKS_MAX, pickerResults } from "@/lib/codex/see-also";
import type { CodexEntryLink } from "@/lib/codex/types";
import { Input } from "@/components/ui/input";
import { SeeAlsoChips } from "./see-also-chips";
import { SeeAlsoResults } from "./see-also-results";

// See also on a form (www#127, 5D): the linked entries as chips, then a
// search across the Club Codex's three parts that leaves out the entry being
// edited (`self`). Arrow keys move through the results, Enter links the lit
// one, Escape closes them. The links save with the entry.
export function SeeAlsoPicker({
  links,
  self,
  autoFocus,
}: {
  links: Pick<DeskLinks, "links" | "add" | "remove">;
  self: number | null;
  autoFocus?: boolean;
}) {
  const id = useId();
  const [query, setQuery] = useState("");
  const [lit, setLit] = useState(0);
  const [closed, setClosed] = useState(false);
  const search = useCodexEntrySearch(query);
  const results = search.settled ? pickerResults(search.results, self, links.links) : [];
  const open = search.hasQuery && !closed;
  const full = links.links.length >= LINKS_MAX;
  const status = search.error
    ? search.error.message
    : !search.settled
      ? "Searching…"
      : results.length === 0
        ? "Nothing in the Club Codex matches."
        : null;

  function pick(link: CodexEntryLink) {
    links.add(link, self);
    setQuery("");
    setLit(0);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    // Enter here links an entry; it never sends the form around it.
    if (event.key === "Enter") event.preventDefault();
    if (!open) return;
    if (event.key === "Escape") {
      event.preventDefault();
      setClosed(true);
    } else if (results.length > 0 && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      setLit((i) => (i + step + results.length) % results.length);
    } else if (results.length > 0 && event.key === "Enter") {
      event.preventDefault();
      const result = results[Math.min(lit, results.length - 1)];
      if (!result.linked) pick(result);
    }
  }

  return (
    <div>
      <SeeAlsoChips links={links.links} onRemove={links.remove} />
      <div className="relative">
        <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-faint-foreground" />
        <Input
          variant="entry"
          value={query}
          onChange={(event) => {
            setQuery(event.currentTarget.value);
            setLit(0);
            setClosed(false);
          }}
          onKeyDown={onKeyDown}
          onBlur={() => setClosed(true)}
          onFocus={() => setClosed(false)}
          autoFocus={autoFocus}
          disabled={full}
          placeholder={full ? `${LINKS_MAX} linked, the most an entry takes` : "Search the Club Codex"}
          aria-label="Find an entry to link"
          role="combobox"
          aria-expanded={open}
          aria-controls={`${id}-list`}
          aria-autocomplete="list"
          aria-activedescendant={open && results.length > 0 ? `${id}-list-${lit}` : undefined}
          className="h-9 pl-9"
        />
        {open && <SeeAlsoResults id={`${id}-list`} results={results} lit={lit} status={status} onPick={pick} />}
      </div>
    </div>
  );
}
