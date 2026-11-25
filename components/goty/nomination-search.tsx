"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import type { NominatedGame } from "@/lib/goty/awards";
import type { GotyNomination } from "@/lib/goty/types";
import type { GotyNominationsState } from "@/hooks/use-goty-nominations";
import { useGameSearch } from "@/hooks/use-game-search";
import { useGotyEligibility } from "@/hooks/use-goty-eligibility";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { SearchProblemNote } from "@/components/search-problem-note";
import { SearchResult } from "./search-result";
import { NominateBar } from "./nominate-bar";

// The nomination search, in the yellow-edged panel of the member's own
// business: GameDB matches as covers, each checked for the year (a game
// not first released in it is greyed with the reason), a Pick on the
// eligible ones, and the bar that nominates (or swaps in) the picked game.
export function NominationSearch({
  year,
  state,
  full,
  mine,
  nominated,
}: {
  year: number;
  state: GotyNominationsState;
  full: boolean;
  mine: GotyNomination[];
  nominated: NominatedGame[];
}) {
  const [query, setQuery] = useState("");
  const { results, hasQuery, error } = useGameSearch(query);
  const shown = hasQuery ? results.slice(0, 10) : [];
  const eligibility = useGotyEligibility(year, shown.map((g) => g.game_id));
  const mineIds = new Set(mine.map((n) => n.gamedb_game_id));
  const counts = new Map(nominated.map((g) => [g.game.game_id, g.by.length]));

  return (
    <div className="flex flex-col gap-2.5 rounded-[3.2px] border border-highlight bg-card p-3.5 md:p-4.5">
      <InputGroup variant="search">
        <InputGroupAddon>
          <Search aria-hidden />
        </InputGroupAddon>
        <InputGroupInput
          aria-label="Search games"
          placeholder={`Search for a ${year} game…`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </InputGroup>
      <p className="text-[0.82rem] text-faint-foreground">
        Games first released in {year}, any region or platform. Remakes and remasters count by their own release.
        Played it or not, you can nominate it.
      </p>
      {error && <SearchProblemNote problem={error} />}
      {hasQuery && shown.length > 0 && (
        <ul className="mt-1 grid grid-cols-2 gap-3.5 sm:grid-cols-3 xl:grid-cols-5">
          {shown.map((game) => (
            <SearchResult
              key={game.game_id}
              game={game}
              eligibility={eligibility[game.game_id]}
              mine={mineIds.has(game.game_id)}
              nominations={counts.get(game.game_id) ?? 0}
              picked={state.picked?.game_id === game.game_id}
              onPick={() => state.pick(game)}
            />
          ))}
        </ul>
      )}
      {hasQuery && !error && shown.length === 0 && (
        <p className="text-sm text-dim-foreground">No games match yet.</p>
      )}
      <NominateBar state={state} full={full} />
    </div>
  );
}
