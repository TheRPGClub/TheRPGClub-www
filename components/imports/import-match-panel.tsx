"use client";

import { useState } from "react";
import { Check, Search, SkipForward } from "lucide-react";
import {
  applyImportItemAction,
  remapImportItemAction,
  skipImportItemAction,
} from "@/app/actions/imports";
import type { Game } from "@/lib/api/types";
import { importItemTitle } from "@/lib/imports/kinds";
import type { ImportItemPanelProps } from "@/components/imports/import-item-panel";
import { ImportCandidateList } from "@/components/imports/import-candidate-list";
import { ImportIgdbSuggestions } from "@/components/imports/import-igdb-suggestions";
import { ImportItemDetails } from "@/components/imports/import-item-details";
import { GamePicker } from "@/components/member/game-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Review of one row for the "match a game" imports (collection CSV, Steam):
// choose a candidate, search a different title, pick any GameDB game, import
// one from IGDB, or skip. Every action goes through `perform`, which advances
// to the next row on success.
export function ImportMatchPanel({
  kind,
  userId,
  review,
  disabled,
  perform,
}: ImportItemPanelProps) {
  const { item } = review;
  const title = importItemTitle(kind, item);
  const [remapTitle, setRemapTitle] = useState(title);
  const [picked, setPicked] = useState<Game | null>(null);

  const apply = (label: string, selection: { game_id: number } | { igdb_id: number }) =>
    perform(label, () => applyImportItemAction(kind, userId, item.item_id, selection));

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Row {item.row_index}
          </p>
          <h2 className="text-xl font-semibold tracking-tight break-words">
            {title || <span className="text-muted-foreground">Untitled row</span>}
          </h2>
        </div>
        <ImportItemDetails kind={kind} item={item} />
      </div>

      <section className="space-y-2">
        <h3 className="text-sm font-semibold">Matches in GameDB</h3>
        <ImportCandidateList
          candidates={review.candidates}
          confidence={review.match_confidence}
          disabled={disabled}
          onChoose={(c) => apply(`Adding ${c.title}…`, { game_id: c.game_id })}
        />
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-semibold">Search a different title</h3>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            perform(
              "Searching GameDB…",
              () => remapImportItemAction(kind, userId, item.item_id, remapTitle),
              (payload) => payload,
            );
          }}
        >
          <Input
            value={remapTitle}
            onChange={(e) => setRemapTitle(e.target.value)}
            placeholder="Title to search for"
            aria-label="Different title"
          />
          <Button type="submit" variant="outline" disabled={disabled || !remapTitle.trim()}>
            <Search /> Search
          </Button>
        </form>
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-semibold">Pick a game from GameDB</h3>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
          <GamePicker
            className="flex-1"
            compact
            placeholder="Search GameDB…"
            onPick={setPicked}
          />
          <Button
            type="button"
            disabled={disabled || !picked}
            onClick={() => picked && apply(`Adding ${picked.title}…`, { game_id: picked.game_id })}
          >
            <Check /> Use this game
          </Button>
        </div>
      </section>

      <details className="group space-y-2 rounded-lg border px-3 py-2">
        <summary className="cursor-pointer text-sm font-semibold">
          Not in GameDB? Look it up on IGDB
        </summary>
        <div className="pt-3">
          <ImportIgdbSuggestions
            kind={kind}
            itemId={item.item_id}
            initialQuery={title}
            disabled={disabled}
            onChoose={(hit) => apply(`Importing ${hit.name}…`, { igdb_id: hit.igdb_id })}
          />
        </div>
      </details>

      <div className="flex justify-end border-t pt-4">
        <Button
          type="button"
          variant="ghost"
          disabled={disabled}
          onClick={() =>
            perform("Skipping…", () => skipImportItemAction(kind, userId, item.item_id))
          }
        >
          <SkipForward /> Skip this row
        </Button>
      </div>
    </div>
  );
}
