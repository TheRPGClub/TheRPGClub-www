"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import type { FranchiseGame } from "@/lib/franchises/types";
import type { FranchiseEditor } from "@/hooks/use-franchise-editor";
import { useGameSearch } from "@/hooks/use-game-search";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { GameCover } from "@/components/issue/game-cover";
import { SearchProblemNote } from "@/components/search-problem-note";

// `refused` says why a game can't be a parent (the API would refuse it).
type Pick = { game_id: number; title: string; cover_url: string | null; year: string | null; refused?: string };

// "Which game is it an Add-on of?": asked when a game is dropped into
// Add-ons (or an Add-on's "Another game" is pressed). The Franchise's own
// games come first; any GameDB game can be found below. A pick saves at
// once; closing puts the game back where it was.
export function AddOnParentDialog({
  game,
  picks,
  editor,
  onPick,
  onCancel,
}: {
  game: FranchiseGame | null;
  picks: FranchiseGame[];
  editor: FranchiseEditor;
  onPick: (parentId: number) => void;
  onCancel: () => void;
}) {
  const [query, setQuery] = useState("");
  const { hasQuery, results, loading, error, searchedQuery, trimmedQuery } = useGameSearch(query);
  const settled = hasQuery && !loading && searchedQuery === trimmedQuery;
  const own = picks.map((g) => ({ ...g, year: g.release_year ? String(g.release_year) : null }));
  const found = results
    .filter((g) => g.game_id !== game?.game_id)
    .map((g) => ({
      ...g,
      year: g.initial_release_date?.slice(0, 4) ?? null,
      refused: g.parent_igdb_id ? "An Add-on itself" : g.igdb_id ? undefined : "Not from IGDB",
    }));

  return (
    <Dialog open={game !== null} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Which game is {game?.title} an Add-on of?</DialogTitle>
          <DialogDescription>Pick one from this Franchise, or find any game in GameDB.</DialogDescription>
        </DialogHeader>
        {editor.error && (
          <p role="alert" className="text-sm text-destructive">
            {editor.error}
          </p>
        )}
        {own.length > 0 && !hasQuery && <PickList label="Games in this Franchise" games={own} editor={editor} onPick={onPick} />}
        <div className="relative">
          <Search aria-hidden className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-faint-foreground" />
          <Input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Another game" aria-label="Find its game in GameDB" className="pl-8" />
        </div>
        {error && <SearchProblemNote problem={error} />}
        {settled && found.length === 0 && <p className="text-sm text-faint-foreground">No game in GameDB has that in its title.</p>}
        {hasQuery && found.length > 0 && <PickList label="Matching games" games={found} editor={editor} onPick={onPick} />}
      </DialogContent>
    </Dialog>
  );
}

function PickList({ label, games, editor, onPick }: { label: string; games: Pick[]; editor: FranchiseEditor; onPick: (id: number) => void }) {
  return (
    <ul aria-label={label} className="max-h-64 overflow-y-auto">
      {games.map((g) => (
        <li key={g.game_id} className="flex items-center gap-2.5 border-t border-border py-2 first:border-t-0">
          <GameCover title={g.title} coverUrl={g.cover_url} className="w-7 flex-none" fallbackClassName="p-0.5 text-[0.4rem]" />
          <span className="min-w-0 flex-1 text-[0.92rem] font-semibold">
            {g.title}
            {g.year && <small className="ml-2 font-normal text-faint-foreground">{g.year}</small>}
          </span>
          {g.refused ? (
            <span className="px-2 text-[0.8rem] text-faint-foreground">{g.refused}</span>
          ) : (
            <Button variant="outline" size="xs" disabled={editor.pending} aria-label={`Make it an Add-on of ${g.title}`} onClick={() => onPick(g.game_id)}>
              Pick
            </Button>
          )}
        </li>
      ))}
    </ul>
  );
}
