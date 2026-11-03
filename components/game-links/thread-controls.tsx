"use client";

import { useEffect, useState, useTransition } from "react";
import { Check, LoaderCircle, Plus, Search, Unlink } from "lucide-react";
import { linkThreadAction, unlinkThreadAction } from "@/app/actions/game-links";
import type { ApiCollection, ThreadSearchResult } from "@/lib/api/types";
import { threadLinkState } from "@/lib/game-links";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// The game page's Discord threads controls (Regulars, or Moderator and up):
// unlink one linked thread, and find a thread by name to link. Both actions
// revalidate the page, so the rail's list updates.

export function UnlinkThreadButton({
  threadId,
  threadName,
  gameId,
}: {
  threadId: string;
  threadName: string;
  gameId: number;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function unlink() {
    setError(null);
    startTransition(async () => {
      const result = await unlinkThreadAction(threadId, gameId);
      if (!result.ok) setError(result.error ?? "Couldn't unlink that thread.");
    });
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        aria-label={`Unlink ${threadName}`}
        title="Unlink from this game"
        disabled={pending}
        onClick={unlink}
      >
        {pending ? <LoaderCircle className="animate-spin" /> : <Unlink />}
      </Button>
      {error && (
        <p role="alert" className="col-span-2 text-xs text-destructive">
          {error}
        </p>
      )}
    </>
  );
}

const MIN_QUERY = 2;

export function LinkThreadPicker({ gameId }: { gameId: number }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ThreadSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rowError, setRowError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  // Bumped after a link so the search re-reads and the row shows "Linked".
  const [refreshKey, setRefreshKey] = useState(0);

  const trimmed = query.trim();
  const hasQuery = trimmed.length >= MIN_QUERY;

  useEffect(() => {
    if (!hasQuery) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `/api/threads/search?per=8&q=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal },
        );
        if (res.status === 403) {
          throw new Error("Only Regulars, Moderators, Admins and Superadmins can search threads.");
        }
        if (!res.ok) throw new Error("Search failed. Try again.");
        const body = (await res.json()) as ApiCollection<ThreadSearchResult>;
        setResults(body.data);
        setSearchError(null);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setSearchError((err as Error).message);
        }
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [trimmed, hasQuery, refreshKey]);

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
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-paper-mute" />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Find a thread by name…"
          aria-label="Find a thread by name"
          className="pl-9"
        />
      </div>

      {searchError && <p className="text-xs text-destructive">{searchError}</p>}
      {rowError && (
        <p role="alert" className="text-xs text-destructive">
          {rowError}
        </p>
      )}

      {hasQuery && !searchError && (
        <ul
          aria-label="Matching threads"
          className="max-h-72 overflow-y-auto rounded-sm border border-rule-strong bg-ink-3 shadow-[0_12px_30px_rgb(0_0_0/0.45)]"
        >
          {loading && results.length === 0 && (
            <li className="px-3 py-2.5 text-xs text-paper-mute">Searching…</li>
          )}
          {!loading && results.length === 0 && (
            <li className="px-3 py-2.5 text-xs text-paper-mute">
              No thread has that in its name.
            </li>
          )}
          {results.map((thread) => {
            const { linkedHere, others } = threadLinkState(thread, gameId);
            const busy = busyId === thread.thread_id;
            return (
              <li
                key={thread.thread_id}
                className="grid grid-cols-[1fr_auto] items-center gap-3 border-t border-rule px-3 py-2 text-sm first:border-t-0"
              >
                <span className="min-w-0">
                  <span className="block truncate font-semibold">
                    {thread.thread_name}
                  </span>
                  {others.length > 0 && (
                    <span className="block truncate text-xs text-paper-mute">
                      Also on {others.join(", ")}
                    </span>
                  )}
                </span>
                {linkedHere ? (
                  <span className="font-label flex items-center gap-1 px-2 text-[0.75rem] font-extrabold tracking-[0.08em] text-paper-mute">
                    <Check aria-hidden className="size-3.5" />
                    Linked
                  </span>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    disabled={busyId !== null}
                    onClick={() => link(thread)}
                    aria-label={`Link ${thread.thread_name}`}
                  >
                    {busy ? (
                      <LoaderCircle data-icon="inline-start" className="animate-spin" />
                    ) : (
                      <Plus data-icon="inline-start" />
                    )}
                    Link
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
