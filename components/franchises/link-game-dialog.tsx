"use client";

import { useState } from "react";
import { Check, Plus, Search } from "lucide-react";
import type { FranchiseEditor } from "@/hooks/use-franchise-editor";
import { useGameSearch } from "@/hooks/use-game-search";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { GameCover } from "@/components/issue/game-cover";
import { SearchProblemNote } from "@/components/search-problem-note";

// "Link a game" (design 6B's dashed tile, 6C's search): find a GameDB game
// and link it as Other or Mainline in one press. It saves at once.
export function LinkGameDialog({
  franchiseName,
  onPage,
  editor,
  trigger,
}: {
  franchiseName: string;
  // The games already in the Franchise.
  onPage: Set<number>;
  editor: FranchiseEditor;
  trigger: React.ReactElement;
}) {
  const [query, setQuery] = useState("");
  const { hasQuery, results, loading, error, searchedQuery, trimmedQuery } = useGameSearch(query);
  const settled = hasQuery && !loading && searchedQuery === trimmedQuery;

  return (
    <Dialog onOpenChange={() => setQuery("")}>
      <DialogTrigger render={trigger}>
        <Plus data-icon="inline-start" />
        Link a game
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Link a game to {franchiseName}</DialogTitle>
          <DialogDescription>Not in GameDB? Import it from the Games page first.</DialogDescription>
        </DialogHeader>
        <div className="relative">
          <Search aria-hidden className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-faint-foreground" />
          <Input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Game title" aria-label="Game to link" className="pl-8" autoFocus />
        </div>
        {error && <SearchProblemNote problem={error} />}
        {settled && results.length === 0 && <p className="text-sm text-faint-foreground">No game in GameDB has that in its title.</p>}
        {editor.error && (
          <p role="alert" className="text-sm text-destructive">
            {editor.error}
          </p>
        )}
        {hasQuery && results.length > 0 && (
          <ul aria-label="Matching games" className="max-h-80 overflow-y-auto">
            {results.map((game) => {
              const linked = onPage.has(game.game_id);
              const busy = editor.busy === `link:${game.game_id}`;
              return (
                <li key={game.game_id} className="flex items-center gap-2.5 border-t border-border py-2 first:border-t-0">
                  <GameCover title={game.title} coverUrl={game.cover_url} className="w-7 flex-none" fallbackClassName="p-0.5 text-[0.4rem]" />
                  <span className="min-w-0 flex-1 text-[0.92rem] font-semibold">
                    {game.title}
                    {game.initial_release_date && (
                      <small className="ml-2 font-normal text-faint-foreground">{game.initial_release_date.slice(0, 4)}</small>
                    )}
                  </span>
                  {linked ? (
                    <span className="font-label flex items-center gap-1 px-2 text-[0.75rem] font-extrabold tracking-[0.08em] text-faint-foreground">
                      <Check aria-hidden className="size-3.5" />
                      Linked
                    </span>
                  ) : (
                    <span className="flex gap-1.5">
                      <Button variant="outline" size="xs" disabled={editor.pending} aria-label={`Link ${game.title} as Other`} onClick={() => editor.link(game.game_id, false)}>
                        {busy ? "Linking…" : "Other"}
                      </Button>
                      <Button variant="outline" size="xs" disabled={editor.pending} aria-label={`Link ${game.title} as Mainline`} onClick={() => editor.link(game.game_id, true)}>
                        Mainline
                      </Button>
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}
