"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import type { Game } from "@/lib/api/types";
import { useGameSearch } from "@/hooks/use-game-search";
import { Button } from "@/components/ui/button";
import { Combobox, ComboboxField, ComboboxList } from "@/components/ui/combobox";
import { cn } from "@/lib/utils";
import { IgdbFallback } from "@/components/igdb/igdb-fallback";
import { GamePickerResult } from "@/components/member/game-picker-result";

export interface GamePickerProps {
  // Renders the input + result list inline. Use `compact` for embedded use
  // inside another form (e.g. the review form).
  compact?: boolean;
  // Notified when the user picks a game. Doesn't clear the picker: leave that
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
  // `offerWithMatches` also offers IGDB under a list of GameDB matches, for a
  // picker with no other way out when the right game isn't among them.
  igdbFallback?: (
    | { listLabel: string; purpose?: "list" }
    | { purpose: "donation" }
  ) & { blockedReason: string | null; className?: string; offerWithMatches?: boolean };
}

// A GameDB search that picks one game: a combobox whose matches list inline
// under the field (arrow keys move through them, Enter picks), with the IGDB
// fallback when the GameDB has no match. A picked game shows as a chip with
// its Change.
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
  const { trimmedQuery, hasQuery, results, setResults, loading, error, searchedQuery } = useGameSearch(query);
  const [selected, setSelected] = useState<Game | null>(initialSelection ?? null);
  // The query the member asked to search IGDB for despite GameDB matches.
  const [igdbAskedFor, setIgdbAskedFor] = useState<string | null>(null);

  const pick = (game: Game) => {
    setSelected(game);
    setResults([]);
    onPick(game);
  };
  const answered = !loading && searchedQuery === trimmedQuery;
  const showIgdb = !!igdbFallback && hasQuery && answered && !error && (results.length === 0 || igdbAskedFor === trimmedQuery);
  const offerIgdb = !!igdbFallback?.offerWithMatches && !showIgdb && answered && results.length > 0;

  if (selected) {
    return (
      <div className={cn("flex h-9 items-center gap-2 rounded-sm border border-highlight/60 bg-muted pr-1 pl-3 text-sm", className)}>
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

  const igdbBox = showIgdb && igdbFallback && (
    <IgdbFallback
      key={trimmedQuery}
      query={trimmedQuery}
      variant="picker"
      listLabel={"listLabel" in igdbFallback ? igdbFallback.listLabel : undefined}
      purpose={igdbFallback.purpose}
      blockedReason={igdbFallback.blockedReason}
      onAdded={pick}
    />
  );

  return (
    <Combobox<Game>
      inline
      items={results}
      filter={null}
      inputValue={query}
      onInputValueChange={setQuery}
      value={null}
      onValueChange={(game) => game && pick(game)}
      itemToStringLabel={(game) => game.title}
    >
      <div className={cn("space-y-1.5", className)}>
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-faint-foreground" />
          <ComboboxField type="search" placeholder={placeholder} autoFocus={autoFocus} aria-label={placeholder.replace(/…$/, "")} className="pl-9" />
        </div>

        {error && <p className="text-xs text-destructive">{error}</p>}

        {igdbBox && igdbFallback?.className ? <div className={igdbFallback.className}>{igdbBox}</div> : igdbBox}

        {hasQuery && !showIgdb && (
          <div className={cn("max-h-72 overflow-y-auto rounded-sm border border-border-strong bg-muted shadow-[0_12px_30px_rgb(0_0_0/0.45)]", compact && "max-h-60")}>
            {loading && <p className="px-3 py-2.5 text-xs text-faint-foreground">Searching…</p>}
            {!loading && results.length === 0 && !error && <p className="px-3 py-2.5 text-xs text-faint-foreground">No matches.</p>}
            <ComboboxList aria-label="Matching games" className="max-h-none overflow-visible p-0">
              {(game: Game) => <GamePickerResult key={game.game_id} game={game} />}
            </ComboboxList>
          </div>
        )}

        {offerIgdb && (
          <Button variant="offer" onClick={() => setIgdbAskedFor(trimmedQuery)} className="h-auto w-full justify-start px-3 py-2 text-left text-xs whitespace-normal">
            Not listed? Search IGDB for &ldquo;{trimmedQuery}&rdquo;
          </Button>
        )}
      </div>
    </Combobox>
  );
}
