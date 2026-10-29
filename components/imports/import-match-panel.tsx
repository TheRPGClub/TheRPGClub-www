"use client";

import { useState } from "react";
import { Check, Search, SkipForward } from "lucide-react";
import {
  applyImportItemAction,
  remapImportItemAction,
  skipImportItemAction,
} from "@/app/actions/imports";
import type { Game, SteamCollectionImportItem } from "@/lib/api/types";
import { IMPORT_KINDS, importItemLabel, importItemTitle } from "@/lib/imports/kinds";
import type { ImportItemPanelProps } from "@/components/imports/import-item-panel";
import { ImportCandidateList } from "@/components/imports/import-candidate-list";
import { ImportIgdbSuggestions } from "@/components/imports/import-igdb-suggestions";
import { ImportItemDetails } from "@/components/imports/import-item-details";
import { SteamHeaderImage } from "@/components/imports/steam-item-details";
import { ImportItemLayout, ImportRoute } from "@/components/issue/import-item-layout";
import { GamePicker } from "@/components/member/game-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Review of one row for the "match a game" imports (collection CSV, Steam):
// choose a candidate, search a different title, pick any GameDB game, import
// one from IGDB, or skip. Every action goes through `perform`, which advances
// to the next row on success. The candidates lead; the other routes sit
// beside them as collapsible panels.
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
  const noun = IMPORT_KINDS[kind].itemNoun.one;

  const apply = (label: string, selection: { game_id: number } | { igdb_id: number }) =>
    perform(label, () => applyImportItemAction(kind, userId, item.item_id, selection));

  const steam = kind === "steam" ? (item as SteamCollectionImportItem) : null;
  const noCandidates = review.candidates.length === 0;

  return (
    <ImportItemLayout
      label={`${importItemLabel(kind)} ${item.row_index}`}
      title={title || <span className="text-paper-mute">Untitled {noun}</span>}
      art={
        steam ? (
          <SteamHeaderImage
            key={steam.steam_app_id}
            appId={steam.steam_app_id}
            name={steam.steam_app_name}
          />
        ) : undefined
      }
      facts={<ImportItemDetails kind={kind} item={item} />}
      routes={
        <>
          <ImportRoute title="Search a different title" defaultOpen={noCandidates}>
            <form
              className="flex flex-col gap-2"
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
                <Search data-icon="inline-start" /> Search GameDB
              </Button>
            </form>
          </ImportRoute>
          <ImportRoute title="Pick from GameDB">
            <div className="flex flex-col gap-2">
              <GamePicker compact placeholder="Search GameDB…" onPick={setPicked} />
              <Button
                type="button"
                variant="highlight"
                disabled={disabled || !picked}
                onClick={() =>
                  picked && apply(`Adding ${picked.title}…`, { game_id: picked.game_id })
                }
              >
                <Check data-icon="inline-start" /> Use this game
              </Button>
            </div>
          </ImportRoute>
          <ImportRoute title="Not in GameDB? Try IGDB">
            <ImportIgdbSuggestions
              kind={kind}
              itemId={item.item_id}
              initialQuery={title}
              disabled={disabled}
              onChoose={(hit) => apply(`Importing ${hit.name}…`, { igdb_id: hit.igdb_id })}
            />
          </ImportRoute>
        </>
      }
    >
      <ImportCandidateList
        // A new search result starts a fresh choice.
        key={review.candidates.map((c) => c.game_id).join("-")}
        candidates={review.candidates}
        confidence={review.match_confidence}
        disabled={disabled}
        onChoose={(c) => apply(`Adding ${c.title}…`, { game_id: c.game_id })}
        footer={
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            onClick={() =>
              perform("Skipping…", () => skipImportItemAction(kind, userId, item.item_id))
            }
          >
            <SkipForward data-icon="inline-start" /> Skip this {noun}
          </Button>
        }
      />
    </ImportItemLayout>
  );
}
