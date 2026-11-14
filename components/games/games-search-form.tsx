"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

const DEBOUNCE_MS = 500;

// The index's search field: searches as you type (debounced) and on Enter.
// A winner filter in the URL survives a new search, since the filter sits
// right beside the field and still reads as on.
export function GamesSearchForm({
  defaultQuery,
  winner,
  placeholder,
}: {
  defaultQuery: string;
  winner: string | null;
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
    const ps = new URLSearchParams();
    if (q.trim()) ps.set("q", q.trim());
    if (winner) ps.set("winner", winner);
    router.push(`/games${ps.size ? `?${ps}` : ""}`);
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
      className="flex h-11.5 min-w-0 flex-1 basis-72 items-center gap-2.5 rounded-sm border border-rule-strong bg-ink-2 px-3.5 text-paper-mute transition-colors focus-within:border-paper-mute"
    >
      <Search aria-hidden className="size-4 shrink-0" />
      <label htmlFor="games-search" className="sr-only">
        Search games
      </label>
      <input
        id="games-search"
        type="search"
        name="q"
        placeholder={placeholder}
        value={query}
        onChange={handleChange}
        className="h-full min-w-0 flex-1 bg-transparent text-[0.95rem] text-paper outline-none placeholder:text-paper-mute"
      />
    </form>
  );
}
