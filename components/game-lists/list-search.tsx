"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import type { GameListGame } from "@/lib/game-lists/types";
import { useGameSearch } from "@/hooks/use-game-search";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GameCover } from "@/components/issue/game-cover";

// The index's one search box (pick 1A): Enter finds lists by name or by the
// member who keeps them; the games matching what's typed sit under it, and
// picking one shows the lists holding that game, as a token in the box.
// Both live in the address (`?q=`, `?game=`).
export function ListSearch({ q, game }: { q: string; game: GameListGame | null }) {
  const router = useRouter();
  const [text, setText] = useState(q);
  const { hasQuery, results, searchedQuery, trimmedQuery } = useGameSearch(game ? "" : text);
  const go = (params: { q?: string; game?: number }) => {
    const search = new URLSearchParams();
    if (params.q) search.set("q", params.q);
    if (params.game) search.set("game", String(params.game));
    const query = search.toString();
    router.push(query ? `/lists?${query}` : "/lists");
  };
  const games = hasQuery && searchedQuery === trimmedQuery ? results.slice(0, 5) : [];

  return (
    <div className="max-w-[35rem] space-y-2.5">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          go({ q: text.trim(), game: game?.game_id });
        }}
        className="relative flex items-center gap-2"
      >
        <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-faint-foreground" />
        {game && (
          <Button
            type="button"
            variant="picked"
            size="sm"
            onClick={() => go({ q: text.trim() })}
            aria-label={`Stop searching by ${game.title}`}
            className="absolute top-1/2 left-8 z-[1] max-w-[60%] -translate-y-1/2 gap-1.5 pl-1"
          >
            <GameCover title={game.title} coverUrl={game.cover_url} className="w-3.5" fallbackClassName="hidden" />
            <span className="truncate">{game.title}</span>
            <X aria-hidden />
          </Button>
        )}
        <Input
          type="search"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={game ? "" : "Search lists by name, member or a game in them"}
          aria-label="Search Game Lists by name, member or game"
          className={game ? "pl-[min(60%,14rem)]" : "pl-9"}
        />
      </form>
      {games.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5" aria-label="Lists with a game">
          <span className="font-label mr-1 text-[0.74rem] font-bold tracking-[0.08em] text-faint-foreground">Lists with</span>
          {games.map((g) => (
            <Button key={g.game_id} variant="chip" size="sm" onClick={() => go({ game: g.game_id })} className="gap-1.5 pl-1">
              <GameCover title={g.title} coverUrl={g.cover_url} className="w-3.5" fallbackClassName="hidden" />
              {g.title}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
