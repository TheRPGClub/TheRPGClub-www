"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Search, X } from "lucide-react";
import { NEWS_PATH, newsHref, type NewsFilters } from "@/lib/news";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";

// "Search news titles" in the masthead's tools: a plain GET form on /news that
// submits on Enter; once hydrated it pushes the canonical address (`go`). The
// text follows the address (back/forward, "Clear filters") by re-syncing
// during render.

const FOCUS = "outline-none focus-visible:ring-3 focus-visible:ring-highlight/50";

export function NewsSearchField({
  filters,
  go,
}: {
  filters: NewsFilters;
  go: (href: string) => void;
}) {
  const [text, setText] = useState(filters.q);
  const [synced, setSynced] = useState(filters.q);
  if (synced !== filters.q) {
    setSynced(filters.q);
    setText(filters.q);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    go(newsHref(filters, { q: text }));
  }

  return (
    <form action={NEWS_PATH} method="get" role="search" onSubmit={submit}>
      {filters.categories.length > 0 && (
        <Input type="hidden" name="category" value={filters.categories.join(",")} />
      )}
      {/* The group pads its field beside an addon; here the gap spaces them. */}
      <InputGroup
        variant="search"
        className="h-9 gap-2 pr-1 pl-3 has-[>[data-align=inline-end]]:[&>input]:pr-0 has-[>[data-align=inline-start]]:[&>input]:pl-0"
      >
        <InputGroupAddon className="p-0">
          <Search aria-hidden className="size-4 shrink-0" />
        </InputGroupAddon>
        <InputGroupInput
          type="search"
          name="q"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Search news titles"
          aria-label="Search news titles"
          enterKeyHint="search"
          className="h-full min-w-0 p-0 text-[0.92rem] md:text-[0.92rem] [&::-webkit-search-cancel-button]:hidden"
        />
        {filters.q && (
          <InputGroupAddon align="inline-end" className="p-0">
            <Link
              href={newsHref(filters, { q: "" })}
              scroll={false}
              aria-label="Clear search"
              className={cn(
                "grid size-7 shrink-0 place-items-center rounded-xs transition-colors hover:text-highlight",
                FOCUS,
              )}
            >
              <X aria-hidden className="size-4" />
            </Link>
          </InputGroupAddon>
        )}
      </InputGroup>
    </form>
  );
}
