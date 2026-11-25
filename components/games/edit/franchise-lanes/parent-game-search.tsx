"use client";

import { useState } from "react";
import { useGameSearch } from "@/hooks/use-game-search";
import { Button } from "@/components/ui/button";
import { GameCover } from "@/components/issue/game-cover";
import { SearchProblemNote } from "@/components/search-problem-note";
import { SlotSearchField } from "@/components/games/edit/franchise-lanes/slot-search-field";

// "Which game is it an Add-on of?" in the Add-on of lane: any GameDB game,
// except this one. A game the API would refuse as a parent (an Add-on
// itself, or not from IGDB) says why instead of offering Pick.
export function ParentGameSearch({
  gameId,
  question,
  onPick,
  onClose,
}: {
  gameId: number;
  question: string;
  onPick: (parent: { game_id: number; name: string }) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const { hasQuery, results, loading, error, searchedQuery, trimmedQuery } = useGameSearch(query);
  const settled = hasQuery && !loading && searchedQuery === trimmedQuery;
  const found = results.filter((g) => g.game_id !== gameId);

  return (
    <>
      <p className="font-label px-3.5 pt-3 pb-2 text-[0.8rem] font-extrabold tracking-[0.08em] text-highlight">{question}</p>
      <SlotSearchField value={query} onChange={setQuery} onClose={onClose} label="Find its parent game in GameDB" placeholder="Find the parent game" />
      {error && (
        <div className="border-t border-border p-3">
          <SearchProblemNote problem={error} />
        </div>
      )}
      {settled && found.length === 0 && <p className="border-t border-border px-3.5 py-2.5 text-sm text-faint-foreground">No game in GameDB has that in its title.</p>}
      {hasQuery && found.length > 0 && (
        <ul aria-label="Matching games" className="max-h-72 overflow-y-auto">
          {found.map((g) => {
            const refused = g.parent_igdb_id ? "An Add-on itself" : g.igdb_id ? null : "Not from IGDB";
            return (
              <li key={g.game_id} className="flex items-center gap-3 border-t border-border py-2 pr-3 pl-3.5">
                <GameCover title={g.title} coverUrl={g.cover_url} className="w-7 flex-none" fallbackClassName="p-0.5 text-[0.4rem]" />
                <span className="min-w-0 flex-1 text-[0.92rem] font-semibold">
                  {g.title}
                  {g.initial_release_date && <small className="ml-2 font-normal text-faint-foreground">{g.initial_release_date.slice(0, 4)}</small>}
                </span>
                {refused ? (
                  <span className="px-2 text-[0.8rem] text-faint-foreground">{refused}</span>
                ) : (
                  <Button type="button" variant="outline" size="xs" aria-label={`Make it an Add-on of ${g.title}`} onClick={() => onPick({ game_id: g.game_id, name: g.title })}>
                    Pick
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
