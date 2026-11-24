"use client";

import { Undo2 } from "lucide-react";
import type { DraftGame } from "@/lib/challenges/form";
import { Button } from "@/components/ui/button";

// The games Left out (pick 8A), under both sections: a chip each with Put
// back, which returns it as an Optional Game.
export function LeftOut({ games, onPutBack }: { games: DraftGame[]; onPutBack: (game: DraftGame) => void }) {
  if (games.length === 0) return null;
  return (
    <section aria-labelledby="pool-left-out-heading" className="mt-6">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-border-strong pb-2">
        <h3 id="pool-left-out-heading" className="font-headline text-[1.375rem] leading-none">
          Left out
        </h3>
        <span className="font-label text-sm tracking-[0.08em] text-faint-foreground">{games.length}</span>
        <span className="ml-auto text-[0.88rem] text-faint-foreground">
          Kept out though a source has them, until you put them back
        </span>
      </div>
      <ul className="mt-3 flex flex-wrap gap-2">
        {games.map((game) => (
          <li key={game.game_id}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-label={`Put ${game.title} back as an Optional Game`}
              onClick={() => onPutBack(game)}
              className="gap-2"
            >
              {game.title}
              <span className="text-faint-foreground">Put back</span>
              <Undo2 aria-hidden />
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}
