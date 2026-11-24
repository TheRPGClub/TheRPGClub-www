"use client";

import { useState } from "react";
import { Check, Plus, Search } from "lucide-react";
import type { GameListGame } from "@/lib/game-lists/types";
import { useGameSearch } from "@/hooks/use-game-search";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GameCover } from "@/components/issue/game-cover";
import { SearchProblemNote } from "@/components/search-problem-note";

// The first games of a new list (pick 3C): search, then tap covers to pick
// them; a picked cover rings yellow and carries a check. Picks stay picked
// across searches (they sit in the tray below).
export function GamePickGrid({ picked, onToggle }: { picked: readonly GameListGame[]; onToggle: (game: GameListGame) => void }) {
  const [query, setQuery] = useState("");
  const { hasQuery, results, loading, error, searchedQuery, trimmedQuery } = useGameSearch(query);
  const pickedIds = new Set(picked.map((g) => g.game_id));
  const answered = hasQuery && searchedQuery === trimmedQuery;
  return (
    <div className="space-y-4">
      <div className="relative max-w-[42rem]">
        <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-faint-foreground" />
        <Input
          type="search"
          variant="compose"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for games to put in it"
          aria-label="Search for games to put in the list"
          className="h-12 pl-11 text-[1.05rem] md:text-[1.05rem]"
        />
      </div>
      {error && <SearchProblemNote problem={error} />}
      {!hasQuery && <p className="text-sm text-faint-foreground">Type two letters or more. A list can also start empty.</p>}
      {hasQuery && loading && !answered && <p className="text-sm text-faint-foreground">Searching…</p>}
      {answered && results.length === 0 && <p className="text-sm text-faint-foreground">No games match &ldquo;{trimmedQuery}&rdquo;.</p>}
      {answered && results.length > 0 && (
        <ul className="grid grid-cols-3 gap-x-2.5 gap-y-4 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-8">
          {results.map((game) => {
            const on = pickedIds.has(game.game_id);
            const year = game.initial_release_date ? new Date(game.initial_release_date).getUTCFullYear() : null;
            return (
              <li key={game.game_id}>
                <Button
                  variant="pool-tile"
                  size="bare"
                  aria-pressed={on}
                  aria-label={`${on ? "Unpick" : "Pick"} ${game.title}`}
                  onClick={() => onToggle({ game_id: game.game_id, title: game.title, cover_url: game.cover_url })}
                  className="relative block w-full"
                >
                  <GameCover
                    title={game.title}
                    coverUrl={game.cover_url}
                    className={cn("w-full transition-shadow", on && "shadow-[0_0_0_2px_var(--color-background),0_0_0_4px_var(--color-highlight)]")}
                    fallbackClassName="text-base"
                  />
                  <span
                    aria-hidden
                    className={cn(
                      "absolute top-1.5 right-1.5 grid size-6.5 place-items-center rounded-xs [&_svg]:size-4",
                      on ? "bg-highlight text-highlight-foreground" : "bg-background/80 text-foreground",
                    )}
                  >
                    {on ? <Check /> : <Plus />}
                  </span>
                </Button>
                <p className="mt-1.5 line-clamp-2 text-[0.84rem] leading-tight font-semibold">{game.title}</p>
                {year && <p className="text-[0.76rem] text-faint-foreground">{year}</p>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
