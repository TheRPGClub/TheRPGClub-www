"use client";

import { useState } from "react";
import { Play, Plus } from "lucide-react";
import type { Game } from "@/lib/api/types";
import { resolveEntryId } from "@/lib/api/member-shelf-entry";
import { addPick } from "@/lib/shelf-forms/manage";
import type { SimpleShelfKind } from "@/lib/shelf-forms/values";
import { ShelfFormDialog } from "@/components/member/shelf-forms/shelf-form-dialog";
import { AddBySearch } from "./add-by-search";
import { useShelfManageContext } from "./shelf-manage-context";

const ADD: Record<SimpleShelfKind, { label: string; short: string }> = {
  now_playing: { label: "Start playing", short: "Start" },
  backlog: { label: "Add to Backlog", short: "Add" },
  favorite: { label: "Add to Favorites", short: "Add" },
  collection: { label: "Add to Collection", short: "Add" },
};

// The owner's add on a Now Playing, Backlog, Favorites or Collection page
// (spec api#451, pick 3A): search for a game, then fill the list's own form.
// On Now Playing and Favorites a game already on the page opens its entry
// instead (put back first if its removal is held); Backlog and Collection
// may hold a game again, so they always add (addPick).
export function ShelfAddButton({ kind }: { kind: SimpleShelfKind }) {
  const { owner, listName, entries, manage } = useShelfManageContext();
  const [game, setGame] = useState<Game | null>(null);
  const add = ADD[kind];

  const pick = (picked: Game) => {
    const next = addPick(kind, entries, picked.game_id, (entry) => resolveEntryId(kind, entry), manage.undo);
    if (next.action === "add") return setGame(picked);
    if (next.undoRemoval) manage.undo.undo(next.entryId);
    manage.edit(next.entryId);
  };

  return (
    <>
      <AddBySearch
        label={add.label}
        shortLabel={add.short}
        icon={kind === "now_playing" ? Play : Plus}
        listLabel={listName}
        igdbBlockedReason={owner.igdbBlockedReason}
        onPick={pick}
      />
      {game && (
        <ShelfFormDialog
          open
          onOpenChange={(open) => !open && setGame(null)}
          kind={kind}
          userId={owner.userId}
          game={game}
          platforms={owner.platforms}
          onSaved={(saved) => {
            setGame(null);
            manage.saved(saved);
          }}
        />
      )}
    </>
  );
}
