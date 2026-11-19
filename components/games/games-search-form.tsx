"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { gamesIndexHref } from "@/lib/games/index-href";
import type { Facets } from "@/lib/games/index-facets";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";

const DEBOUNCE_MS = 500;

// The index's search field: searches as you type (debounced) and on Enter.
// A winner filter or a facet in the URL survives a new search, since the
// filters sit right by the field and still read as on.
export function GamesSearchForm({
  defaultQuery,
  winner,
  facets,
  placeholder,
}: {
  defaultQuery: string;
  winner: string | null;
  facets: Facets;
  placeholder: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultQuery);
  // Re-sync the input when the URL's query changes (back/forward, a link),
  // adjusting state during render rather than in an effect.
  const [syncedQuery, setSyncedQuery] = useState(defaultQuery);
  if (syncedQuery !== defaultQuery) {
    setSyncedQuery(defaultQuery);
    setQuery(defaultQuery);
  }
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function navigate(q: string) {
    router.push(gamesIndexHref({ q, winner, facets }));
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => navigate(value), DEBOUNCE_MS);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    navigate(query);
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className="flex min-w-0 flex-1 basis-72"
    >
      {/* The group pads its field after an addon; here the gap spaces them. */}
      <InputGroup
        variant="search"
        className="h-11.5 gap-2.5 px-3.5 has-[>[data-align=inline-start]]:[&>input]:pl-0"
      >
        <InputGroupAddon className="p-0">
          <Search aria-hidden className="size-4 shrink-0" />
        </InputGroupAddon>
        <Label htmlFor="games-search" variant="field" className="sr-only">
          Search games
        </Label>
        <InputGroupInput
          id="games-search"
          type="search"
          name="q"
          placeholder={placeholder}
          value={query}
          onChange={handleChange}
          className="h-full p-0 text-[0.95rem] md:text-[0.95rem]"
        />
      </InputGroup>
    </form>
  );
}
