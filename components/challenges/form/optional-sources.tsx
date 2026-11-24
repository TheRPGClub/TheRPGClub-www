"use client";

import { Info, Layers, LibraryBig, ListOrdered, Plus, X } from "lucide-react";
import type { ChallengeFormState } from "@/hooks/use-challenge-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SourceSearch } from "@/components/challenges/form/source-search";

const SEARCH_ID = "pool-source-search";

// What feeds the Optional Games (pick 8A): a chip per source ("Final Fantasy
// · Franchise · 31 ×", "Final Fantasy VII · Series"), the linked Game List
// when there is one, a dashed "+ Franchise or Series" that opens the search
// in place, and the line that says sources only add Optional Games.
export function OptionalSources({ form }: { form: ChallengeFormState }) {
  const { draft } = form;
  const searching = form.open === "sources";
  return (
    <div className="mt-3 space-y-2.5">
      <div className="flex flex-wrap items-center gap-2">
        {draft.sources.map((source) => (
          <Badge key={`${source.kind}-${source.id}`} tone="picked" className="h-[30px] gap-2 pr-1 pl-2.5">
            {source.kind === "franchise" ? <LibraryBig aria-hidden /> : <Layers aria-hidden />}
            <span>{source.name}</span>
            <span className="text-faint-foreground">
              {source.kind === "franchise" ? "Franchise" : "Series"}
              {source.game_count != null && ` · ${source.game_count}`}
            </span>
            <Button
              type="button"
              variant="chip-remove"
              size="icon-xs"
              aria-label={`Take ${source.name} out of the Pool`}
              onClick={() => form.removeSource(source)}
            >
              <X aria-hidden />
            </Button>
          </Badge>
        ))}
        {draft.gameList && (
          <Badge tone="picked" className="h-[30px] gap-2 px-2.5">
            <ListOrdered aria-hidden />
            <span>{draft.gameList.name}</span>
            <span className="text-faint-foreground">Game List · linked</span>
          </Badge>
        )}
        <Button
          type="button"
          variant="rule-add"
          size="sm"
          aria-expanded={searching}
          aria-controls={SEARCH_ID}
          onClick={() => form.toggleWord("sources")}
          className="gap-1.5"
        >
          <Plus aria-hidden /> Franchise or Series
        </Button>
      </div>
      {searching && (
        <div
          id={SEARCH_ID}
          role="group"
          aria-label="Add a Franchise or Series"
          onKeyDown={(event) => {
            if (event.key === "Escape") form.closeWord();
          }}
          className="max-w-xl"
        >
          <SourceSearch form={form} />
        </div>
      )}
      <p className="flex items-start gap-2 text-[0.9rem] leading-[1.45] text-faint-foreground">
        <Info aria-hidden className="mt-0.5 size-4 shrink-0" />
        <span>
          Sources only add Optional Games, and new ones join by themselves. Add-ons (DLC, expansions) never come in by
          themselves; add one with the search above.
          {draft.gameList && " Games added to the linked list later arrive here too."}
        </span>
      </p>
    </div>
  );
}
