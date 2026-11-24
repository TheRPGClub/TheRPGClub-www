"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { removeMemberShelfEntryAction } from "@/app/actions/member-shelf";
import { useUndoDelete } from "@/hooks/use-undo-delete";
import type { ShelfSaved } from "@/hooks/use-shelf-save";
import { resolveEntryId } from "@/lib/api/member-shelf-entry";
import type { Platform } from "@/lib/api/types";
import {
  SHELF_ROUTES,
  SHELF_TITLES,
  nextStep,
  shelfChips,
  shelfRows,
  withoutList,
  type GameShelf,
  type ShelfList,
  type ShelfShown,
} from "@/lib/games/shelf";
import type { SimpleShelfEntry, SimpleShelfKind } from "@/lib/shelf-forms/values";
import { UndoBar } from "@/components/admin/desk/undo-bar";
import type { ShelfGame } from "@/components/member/shelf-forms/shelf-entry-form";
import { ShelfChips } from "./shelf-chips";
import { ShelfFormsHost, shelfEntry } from "./shelf-forms-host";
import { ShelfSplitButton } from "./shelf-split-button";

// A held removal: "<kind>:<entry id>", so a game put back on the list later
// (a new entry) isn't hidden by an old removal.
const heldKey = (kind: SimpleShelfKind, entryId: number) => `${kind}:${entryId}`;
const KINDS: SimpleShelfKind[] = ["now_playing", "backlog", "favorite", "collection"];

// The game page's list control for a signed-in member (spec api#451, 1A):
// the split button and the state chips, the shared forms it opens, and a
// removal held behind Undo. Every save re-reads the page.
export function ShelfActions(props: {
  userId: string;
  game: ShelfGame;
  shelf: GameShelf;
  shown: ShelfShown;
  platforms: Platform[];
}) {
  const { userId, game, shown, platforms } = props;
  const router = useRouter();
  const [open, setOpen] = useState<ShelfList | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const removal = useUndoDelete<string>({
    commit: async (key) => {
      const [kind, id] = key.split(":");
      const result = await removeMemberShelfEntryAction(userId, kind as SimpleShelfKind, Number(id));
      if (!result.ok) return { error: result.error ?? "Couldn't remove it." };
      router.refresh();
    },
  });

  // The shelf as the member sees it: held and sent removals taken off.
  const shelf = KINDS.reduce((acc, kind) => {
    const entry = shelfEntry(acc, kind);
    const id = entry && resolveEntryId(kind, entry);
    if (id == null) return acc;
    const key = heldKey(kind, id);
    return removal.held.has(key) || removal.gone.has(key) ? withoutList(acc, kind) : acc;
  }, props.shelf);

  const platformName = (id: number | null | undefined) => {
    const p = id == null ? undefined : platforms.find((x) => x.platform_id === id);
    return p ? (p.platform_abbreviation ?? p.platform_name) : null;
  };
  const listLink = shown.completed
    ? { href: `/members/${userId}/${SHELF_ROUTES.completed}`, label: "Your Completed list" }
    : { href: `/members/${userId}`, label: "Your profile" };

  const onSaved = (saved: ShelfSaved) => {
    setOpen(null);
    setNotice(saved.leftNowPlaying ? "Logged. It left your Now Playing." : null);
    router.refresh();
  };
  const onRemove = (kind: SimpleShelfKind, entry: SimpleShelfEntry) => {
    const id = resolveEntryId(kind, entry);
    setOpen(null);
    setNotice(null);
    if (id != null) removal.hold(heldKey(kind, id));
  };

  return (
    <div className="col-span-full flex flex-col gap-2.5 md:mt-4.5">
      <div className="flex flex-wrap items-center gap-2">
        <ShelfSplitButton
          step={nextStep(shelf, shown)}
          rows={shelfRows(shelf, shown, platformName)}
          gameTitle={game.title}
          listLink={listLink}
          onPick={(row) => {
            setNotice(null);
            setOpen(row.list);
          }}
        />
        <ShelfChips chips={shelfChips(shelf, shown)} />
      </div>
      {[...removal.held].map((key) => (
        <UndoBar
          key={key}
          className="max-w-md"
          message={`Removed from ${SHELF_TITLES[key.split(":")[0] as SimpleShelfKind]}.`}
          delayMs={removal.delayMs}
          onUndo={() => removal.undo(key)}
        />
      ))}
      {[...removal.errors].map(([key, error]) => (
        <p key={key} role="alert" className="text-[0.84rem] text-destructive">
          {error}
        </p>
      ))}
      {notice && (
        <p role="status" className="font-label text-[0.82rem] font-bold tracking-[0.07em] text-dim-foreground uppercase">
          {notice}
        </p>
      )}
      <ShelfFormsHost
        open={open}
        onClose={() => setOpen(null)}
        userId={userId}
        game={game}
        shelf={shelf}
        platforms={platforms}
        onSaved={onSaved}
        onRemove={onRemove}
      />
    </div>
  );
}
