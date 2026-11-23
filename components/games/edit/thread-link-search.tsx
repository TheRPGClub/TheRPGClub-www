"use client";

import { useState } from "react";
import { Check, Plus, Search } from "lucide-react";
import type { ThreadSearchResult } from "@/lib/api/types";
import { useThreadSearch } from "@/hooks/use-thread-search";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchProblemNote } from "@/components/search-problem-note";

// The Game Threads section's search (design www#156, round 3): find a
// Discord thread by name and stage linking it. A thread already on the game,
// or staged to be, reads "Linked".
export function ThreadLinkSearch({
  gameId,
  picked,
  onPick,
}: {
  gameId: number;
  picked: (threadId: string) => boolean;
  onPick: (thread: ThreadSearchResult) => void;
}) {
  const [query, setQuery] = useState("");
  const { hasQuery, results, loading, error } = useThreadSearch(query, 0);

  return (
    <div className="relative w-full sm:w-88">
      <Search aria-hidden className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-faint-foreground" />
      <Input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Link a Discord thread by name"
        aria-label="Link a Discord thread by name"
        className="pl-8"
      />
      {hasQuery && (
        <div className="absolute top-full right-0 left-0 z-20 mt-1 max-h-72 overflow-y-auto rounded-sm border border-border-strong bg-muted shadow-[0_12px_30px_rgb(0_0_0/0.45)]">
          {error ? (
            <div className="p-3">
              <SearchProblemNote problem={error} />
            </div>
          ) : (
            <ul aria-label="Matching threads">
              {loading && results.length === 0 && <li className="px-3 py-2.5 text-xs text-faint-foreground">Searching…</li>}
              {!loading && results.length === 0 && (
                <li className="px-3 py-2.5 text-xs text-faint-foreground">No thread has that in its name.</li>
              )}
              {results.map((thread) => {
                const others = thread.games.filter((g) => g.game_id !== gameId).map((g) => g.title);
                return (
                  <li
                    key={thread.thread_id}
                    className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-t border-border px-3 py-2 text-sm first:border-t-0"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{thread.thread_name}</span>
                      {others.length > 0 && (
                        <span className="block truncate text-xs text-faint-foreground">Also on {others.join(", ")}</span>
                      )}
                    </span>
                    {picked(thread.thread_id) ? (
                      <span className="font-label flex items-center gap-1 px-2 text-[0.75rem] font-extrabold tracking-[0.08em] text-faint-foreground">
                        <Check aria-hidden className="size-3.5" />
                        Linked
                      </span>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        onClick={() => {
                          onPick(thread);
                          setQuery("");
                        }}
                        aria-label={`Link ${thread.thread_name}`}
                      >
                        <Plus data-icon="inline-start" />
                        Link
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
