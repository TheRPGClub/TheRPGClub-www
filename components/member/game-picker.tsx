"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import type { ApiCollection, Game } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { IgdbFallback } from "@/components/igdb/igdb-fallback";

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
  // Offer "add it from IGDB" when the GameDB has no match. The added game is
  // picked like any other. `blockedReason` explains why the viewer can't add
  // one, or is null when they can. A list picker names its list; the donate
  // form passes `purpose: "donation"` instead. `className` styles a box around
  // the fallback, for a picker on a light surface (its copy is light on dark).
  igdbFallback?: (
    | { listLabel: string; purpose?: "list" }
    | { purpose: "donation" }
  ) & { blockedReason: string | null; className?: string };
}

export function GamePicker({
  compact,
  onPick,
  initialSelection,
  placeholder = "Search games…",
  autoFocus,
  className,
  igdbFallback,
}: GamePickerProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Game | null>(initialSelection ?? null);
  // The query `results` answer, so the IGDB fallback waits for this query's
  // GameDB search rather than showing on a stale or pending one.
  const [searchedQuery, setSearchedQuery] = useState<string | null>(null);

  const trimmedQuery = query.trim();
  const hasQuery = trimmedQuery.length >= 2;

  useEffect(() => {
    if (!hasQuery) return;

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `/api/games/search?per=8&q=${encodeURIComponent(trimmedQuery)}`,
          { signal: controller.signal },
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const body = (await res.json()) as ApiCollection<Game>;
        setResults(body.data);
        setSearchedQuery(trimmedQuery);
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

  const pick = (game: Game) => {
    setSelected(game);
    setResults([]);
    onPick(game);
  };
  const showIgdb =
    !!igdbFallback &&
    hasQuery &&
    !loading &&
    !error &&
    searchedQuery === trimmedQuery &&
    results.length === 0;

  if (selected) {
    return (
      <div
        className={cn(
          "flex h-9 items-center gap-2 rounded-sm border border-highlight/60 bg-ink-3 pr-1 pl-3 text-sm",
          className,
        )}
      >
        <span className="min-w-0 flex-1 truncate font-semibold">{selected.title}</span>
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
    <div className={cn("space-y-1.5", className)}>
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-paper-mute" />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          aria-label={placeholder.replace(/…$/, "")}
          className="pl-9"
        />
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      {showIgdb && (
        <div className={igdbFallback.className}>
          <IgdbFallback
            key={trimmedQuery}
            query={trimmedQuery}
            variant="picker"
            listLabel={"listLabel" in igdbFallback ? igdbFallback.listLabel : undefined}
            purpose={igdbFallback.purpose}
            blockedReason={igdbFallback.blockedReason}
            onAdded={pick}
          />
        </div>
      )}

      {hasQuery && !showIgdb && (
        <div
          className={cn(
            "max-h-72 overflow-y-auto rounded-sm border border-rule-strong bg-ink-3 shadow-[0_12px_30px_rgb(0_0_0/0.45)]",
            compact && "max-h-60",
          )}
          role="listbox"
          aria-label="Matching games"
        >
          {loading && (
            <p className="px-3 py-2.5 text-xs text-paper-mute">Searching…</p>
          )}
          {!loading && results.length === 0 && !error && (
            <p className="px-3 py-2.5 text-xs text-paper-mute">No matches.</p>
          )}
          {results.map((game) => {
            const year = game.initial_release_date
              ? new Date(game.initial_release_date).getFullYear()
              : null;
            const platforms = (game.platforms ?? [])
              .slice(0, 3)
              .map((p) => p.platform_abbreviation ?? p.platform_name);
            return (
              <button
                key={game.game_id}
                type="button"
                role="option"
                aria-selected={false}
                onClick={() => pick(game)}
                className="group/result grid w-full grid-cols-[2.1rem_1fr_auto] items-center gap-3 border-t border-rule px-2.5 py-2 text-left text-sm transition-colors first:border-t-0 hover:bg-highlight/8 focus-visible:bg-highlight/8 focus-visible:outline-none"
              >
                <span className="block h-11 w-[2.1rem] overflow-hidden rounded-[2px] bg-ink-2">
                  {game.cover_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={game.cover_url}
                      alt=""
                      className="size-full object-cover"
                    />
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-semibold">{game.title}</span>
                  {(year || platforms.length > 0) && (
                    <span className="block truncate text-xs text-paper-mute">
                      {[year, ...platforms].filter(Boolean).join(" · ")}
                    </span>
                  )}
                </span>
                <span className="font-label rounded-xs border border-rule-strong px-2 py-0.5 text-[0.75rem] font-extrabold tracking-[0.08em] text-paper-dim transition-colors group-hover/result:border-highlight group-hover/result:bg-highlight group-hover/result:text-ink">
                  Pick
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
