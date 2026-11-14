"use client";

import { Loader2, Plus } from "lucide-react";
import {
  resolveEntryId,
  type GameListEntry,
  type GameListKind,
} from "@/lib/api/game-list-entry";
import type { Platform } from "@/lib/api/types";
import { useGameListEditor } from "@/hooks/use-game-list-editor";
import { SectionHeading } from "@/components/templates/page-header";
import { Button } from "@/components/ui/button";
import { AddGamePanel } from "./game-list/add-game-panel";
import { ListEntryTile } from "./game-list/list-entry-tile";

export interface GameListEditorProps {
  userId: string;
  kind: GameListKind;
  title: string;
  description?: string;
  entries: GameListEntry[];
  // Total count from the backend — we may only have a partial preview window.
  total?: number;
  platforms: Platform[];
  // Why the viewer can't add a missing game from IGDB, or null when they can.
  igdbBlockedReason: string | null;
}

// One of the member's lists as a shelf of covers: each cover carries its
// remove button, and the dashed Add tile at the end opens the game picker
// inline above the shelf.
export function GameListEditor({
  userId,
  kind,
  title,
  description,
  entries,
  total,
  platforms,
  igdbBlockedReason,
}: GameListEditorProps) {
  const editor = useGameListEditor(userId, kind);
  const shownCount = entries.length;
  const displayedTotal = total ?? shownCount;
  const hasMoreThanShown = total !== undefined && total > shownCount;

  return (
    <section aria-label={title} className="space-y-4">
      <div className="space-y-2.5">
        <SectionHeading
          as="h2"
          title={title}
          count={`${displayedTotal} ${displayedTotal === 1 ? "game" : "games"}`}
          className="[&_h2]:text-4xl sm:[&_h2]:text-[2.75rem]"
          action={
            editor.pending ? (
              <span className="font-label inline-flex items-center gap-1.5 text-sm text-faint-foreground">
                <Loader2 aria-hidden className="size-3.5 animate-spin" />
                Saving…
              </span>
            ) : undefined
          }
        />
        {description && <p className="text-sm text-faint-foreground">{description}</p>}
      </div>

      {editor.error && (
        <p role="alert" className="text-sm text-destructive">
          {editor.error}
        </p>
      )}

      {editor.adding && (
        <AddGamePanel
          kind={kind}
          title={title}
          platforms={platforms}
          options={editor.options}
          pending={editor.pending}
          igdbBlockedReason={igdbBlockedReason}
          onPick={editor.add}
          onCancel={editor.close}
        />
      )}

      <ul className="grid grid-cols-3 gap-x-3 gap-y-4 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {entries.map((entry, index) => {
          const id = resolveEntryId(kind, entry);
          return (
            <li key={id ?? `unresolved-${index}`} className="min-w-0">
              <ListEntryTile
                kind={kind}
                entry={entry}
                removable={!editor.pending && id !== undefined}
                onRemove={() => editor.remove(id)}
              />
            </li>
          );
        })}
        {!editor.adding && (
          <li>
            <Button
              type="button"
              variant="add"
              size="tile"
              onClick={editor.open}
              disabled={editor.pending}
            >
              <Plus aria-hidden className="size-5" />
              Add a game
            </Button>
          </li>
        )}
      </ul>

      {shownCount === 0 && (
        <p className="text-sm text-faint-foreground">
          Nothing here yet. Add a game to start this list.
        </p>
      )}

      {hasMoreThanShown && (
        <p className="text-sm text-faint-foreground">
          Showing the first {shownCount}. Use the profile page to browse the
          full list.
        </p>
      )}
    </section>
  );
}
