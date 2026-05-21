"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import type { ApiCollection, Game } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface GamePickerProps {
  // Renders the input + result list inline. Use `compact` for embedded use
  // inside another form (e.g. the review form).
  compact?: boolean;
  // Notified when the user picks a game. Doesn't clear the picker — leave that
  // to the parent so it can decide what UX makes sense.
  onPick: (game: Game) => void;
  initialSelection?: Game | null;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
}

export function GamePicker({
  compact,
  onPick,
  initialSelection,
  placeholder = "Search games…",
  autoFocus,
  className,
}: GamePickerProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Game | null>(initialSelection ?? null);

  const trimmedQuery = query.trim();
  const hasQuery = trimmedQuery.length >= 2;

  useEffect(() => {
    if (!hasQuery) return;

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `/api/games/search?limit=8&q=${encodeURIComponent(trimmedQuery)}`,
          { signal: controller.signal },
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const body = (await res.json()) as ApiCollection<Game>;
        setResults(body.data);
        setError(null);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setError("Search failed. Try again.");
        }
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [trimmedQuery, hasQuery]);

  if (selected) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-md border bg-muted/40 px-2 py-1.5 text-sm",
          className,
        )}
      >
        <span className="truncate font-medium">{selected.title}</span>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label="Change game"
          onClick={() => {
            setSelected(null);
            setQuery("");
            setResults([]);
          }}
        >
          <X />
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="pl-8"
        />
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      {hasQuery && (
        <div
          className={cn(
            "max-h-72 overflow-y-auto rounded-md border bg-popover",
            compact && "max-h-48",
          )}
          role="listbox"
        >
          {loading && (
            <p className="px-3 py-2 text-xs text-muted-foreground">Searching…</p>
          )}
          {!loading && results.length === 0 && !error && (
            <p className="px-3 py-2 text-xs text-muted-foreground">
              No matches.
            </p>
          )}
          {results.map((game) => (
            <button
              key={game.game_id}
              type="button"
              onClick={() => {
                setSelected(game);
                setResults([]);
                onPick(game);
              }}
              className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-muted"
            >
              {game.cover_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={game.cover_url}
                  alt=""
                  className="size-10 shrink-0 rounded object-cover"
                />
              ) : (
                <div className="size-10 shrink-0 rounded bg-muted" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{game.title}</p>
                {game.initial_release_date && (
                  <p className="text-xs text-muted-foreground">
                    {new Date(game.initial_release_date).getFullYear()}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
