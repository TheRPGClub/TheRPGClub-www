"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { ChallengeFormState } from "@/hooks/use-challenge-form";
import type { PoolGame } from "@/lib/challenges/types";
import { Button } from "@/components/ui/button";
import { SearchProblemNote } from "@/components/search-problem-note";
import { PoolTile } from "@/components/challenges/form/pool-tile";
import { AddGameDialog } from "@/components/challenges/form/add-game-dialog";
import { BuiltFrom } from "@/components/challenges/form/built-from";

const PAGE = 40;

// The Pool under the sentence (surface brief challenges-form, 5C): the games
// it means right now, as a cover wall to tap games out of, with what it is
// built from and a tally, and a last tile to add a game by hand.
export function PoolBuilder({ form }: { form: ChallengeFormState }) {
  const { draft, preview, locked } = form;
  const [showAll, setShowAll] = useState(false);
  const [adding, setAdding] = useState(false);
  const excluded = new Set(draft.excluded.map((g) => g.game_id));
  const added = new Set(draft.included.map((g) => g.game_id));
  // Games added by hand that the preview hasn't answered for yet.
  const pending: PoolGame[] = draft.included.filter((g) => !preview.games.some((p) => p.game_id === g.game_id));
  const games = [...preview.games, ...pending];
  const visible = showAll ? games : games.slice(0, PAGE);
  const fromSources = games.length - added.size;
  const sourceNames = draft.sources.map((s) => s.name).join(", ");
  return (
    <section aria-labelledby="pool-heading" className="mt-[34px]">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b-2 border-foreground pb-2">
        <h2 id="pool-heading" className="font-headline text-[1.875rem]">
          The Pool
        </h2>
        <span className="font-label text-sm tracking-[0.08em] text-faint-foreground">
          {preview.loading ? "Counting…" : `${preview.size} ${preview.size === 1 ? "game" : "games"}`}
        </span>
        {!locked && (
          <span className="ml-auto text-[0.88rem] text-faint-foreground">
            Tap a cover to leave it out. New franchise games join by themselves.
          </span>
        )}
      </div>
      {(draft.sources.length > 0 || games.length > 0) && (
        <BuiltFrom
          form={form}
          tally={[
            sourceNames && `${fromSources} from ${sourceNames}`,
            added.size && `${added.size} added`,
            excluded.size && `${excluded.size} left out`,
          ]
            .filter(Boolean)
            .join(" · ")}
        />
      )}
      {preview.problem && <SearchProblemNote problem={preview.problem} className="mt-3" />}
      {games.length === 0 && !preview.loading && (
        <p className="mt-4 rounded-md border border-dashed border-border-strong px-4 py-3.5 text-faint-foreground">
          Add a Franchise or a Series in the sentence above, or a game by hand, and its games show here.
        </p>
      )}
      <ul className="mt-3.5 grid grid-cols-4 gap-x-3 gap-y-3.5 sm:grid-cols-6 lg:grid-cols-8 2xl:grid-cols-10">
        {visible.map((game) => (
          <li key={game.game_id}>
            <PoolTile
              game={game}
              locked={locked}
              state={added.has(game.game_id) ? "added" : excluded.has(game.game_id) ? "out" : "in"}
              onToggle={() =>
                form.toggleGame({
                  game_id: game.game_id,
                  title: game.title,
                  cover_url: game.cover_url,
                })
              }
            />
          </li>
        ))}
        {!locked && (
          <li>
            <Button type="button" variant="add" size="tile" onClick={() => setAdding(true)}>
              <Plus aria-hidden /> Add a game by hand
            </Button>
          </li>
        )}
      </ul>
      {!showAll && games.length > PAGE && (
        <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => setShowAll(true)}>
          Show all {games.length}
        </Button>
      )}
      <AddGameDialog open={adding} onOpenChange={setAdding} onPick={form.includeGame} />
    </section>
  );
}
