"use client";

import { useState, useTransition } from "react";
import { Search } from "lucide-react";
import { linkThreadAction } from "@/app/actions/game-links";
import type { ThreadSearchResult } from "@/lib/api/types";
import { useThreadSearch } from "@/hooks/use-thread-search";
import { Input } from "@/components/ui/input";
import { ThreadResult } from "@/components/game-links/thread-result";
import { SearchProblemNote } from "@/components/search-problem-note";

// Finds a Discord thread by name and links it to the game (Regulars, or
// Moderator and up). The action revalidates the page, so the rail's list
// updates.
export function LinkThreadPicker({ gameId }: { gameId: number }) {
  const [query, setQuery] = useState("");
  // Bumped after a link so the search re-reads and the row shows "Linked".
  const [refreshKey, setRefreshKey] = useState(0);
  const { hasQuery, results, loading, error: searchError } = useThreadSearch(query, refreshKey);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rowError, setRowError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function link(thread: ThreadSearchResult) {
    setBusyId(thread.thread_id);
    setRowError(null);
    startTransition(async () => {
      const result = await linkThreadAction(thread.thread_id, gameId);
      setBusyId(null);
      if (!result.ok) {
        setRowError(result.error ?? "Couldn't link that thread.");
        return;
      }
      setRefreshKey((k) => k + 1);
    });
  }

  return (
    <div className="mt-3 space-y-1.5">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-faint-foreground" />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Find a thread by name…"
          aria-label="Find a thread by name"
          className="pl-9"
        />
      </div>

      {searchError && <SearchProblemNote problem={searchError} />}
      {rowError && (
        <p role="alert" className="text-xs text-destructive">
          {rowError}
        </p>
      )}

      {hasQuery && !searchError && (
        <ul
          aria-label="Matching threads"
          className="max-h-72 overflow-y-auto rounded-sm border border-border-strong bg-muted shadow-[0_12px_30px_rgb(0_0_0/0.45)]"
        >
          {loading && results.length === 0 && (
            <li className="px-3 py-2.5 text-xs text-faint-foreground">Searching…</li>
          )}
          {!loading && results.length === 0 && (
            <li className="px-3 py-2.5 text-xs text-faint-foreground">
              No thread has that in its name.
            </li>
          )}
          {results.map((thread) => (
            <ThreadResult
              key={thread.thread_id}
              thread={thread}
              gameId={gameId}
              busy={busyId === thread.thread_id}
              disabled={busyId !== null}
              onLink={() => link(thread)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
