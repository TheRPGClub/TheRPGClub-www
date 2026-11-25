"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { browseHref, type FranchiseSort } from "@/lib/franchises/browse";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";

const DEBOUNCE_MS = 400;

// "Find a Franchise": searches as you type (debounced) and on Enter, from
// page one under the same sort. A search looks through every name, so it
// lets go of a picked letter. "/" anywhere on the page outside a field
// jumps to it.
export function FranchiseSearch({
  q,
  sort,
}: {
  q: string;
  sort: FranchiseSort;
}) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(q);
  // Back/forward or a link changed the URL's search: follow it.
  const [synced, setSynced] = useState(q);
  if (synced !== q) {
    setSynced(q);
    setQuery(q);
  }
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const go = (value: string) =>
    router.push(browseHref({ q: value, sort }), { scroll: false });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const at = e.target as HTMLElement | null;
      if (at?.closest("input, textarea, select, [contenteditable=true]"))
        return;
      e.preventDefault();
      input.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return (
    <form
      role="search"
      className="flex min-w-0 flex-1 basis-72 sm:max-w-[26rem]"
      onSubmit={(e) => {
        e.preventDefault();
        if (timer.current) clearTimeout(timer.current);
        go(query);
      }}
    >
      <InputGroup
        variant="search"
        className="h-11.5 gap-2.5 px-3.5 has-[>[data-align=inline-start]]:[&>input]:pl-0"
      >
        <InputGroupAddon className="p-0">
          <Search aria-hidden className="size-4 shrink-0" />
        </InputGroupAddon>
        <Label htmlFor="franchise-search" variant="field" className="sr-only">
          Find a Franchise
        </Label>
        <InputGroupInput
          ref={input}
          id="franchise-search"
          type="search"
          name="q"
          placeholder="Find a Franchise"
          aria-keyshortcuts="/"
          value={query}
          onChange={(e) => {
            const value = e.target.value;
            setQuery(value);
            if (timer.current) clearTimeout(timer.current);
            timer.current = setTimeout(() => go(value), DEBOUNCE_MS);
          }}
          className="h-full p-0 text-[0.95rem] md:text-[0.95rem]"
        />
        <InputGroupAddon align="inline-end" className="p-0 max-sm:hidden">
          <kbd className="font-label rounded-xs px-1.5 py-0.5 text-[0.72rem] leading-none font-bold text-faint-foreground shadow-[inset_0_0_0_1px_var(--color-border-strong)]">
            /
          </kbd>
        </InputGroupAddon>
      </InputGroup>
    </form>
  );
}
