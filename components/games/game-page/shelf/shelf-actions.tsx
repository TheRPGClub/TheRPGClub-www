"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { removeMemberShelfEntryAction } from "@/app/actions/member-shelf";
import { useUndoDelete } from "@/hooks/use-undo-delete";
import type { ShelfSaved } from "@/hooks/use-shelf-save";
import type { Platform } from "@/lib/api/types";
import {
  SHELF_LISTS,
  SHELF_ROUTES,
  SHELF_TITLES,
  nextStep,
  shelfChips,
  shelfRows,
  withoutEntry,
  type GameShelf,
  type ShelfList,
  type ShelfShown,
} from "@/lib/games/shelf";
import { UndoBar } from "@/components/admin/desk/undo-bar";
import type { ShelfGame } from "@/components/member/shelf-forms/shelf-entry-form";
import { ShelfChips } from "./shelf-chips";
import { ShelfFormsHost, type ShelfOpen } from "./shelf-forms-host";
import { ShelfSplitButton } from "./shelf-split-button";

// A held removal: "<kind>:<entry id>", so a game put back on the list later
// (a new entry) isn't hidden by an old removal.
const heldKey = (list: ShelfList, entryId: number) => `${list}:${entryId}`;

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
  const [open, setOpen] = useState<ShelfOpen | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const removal = useUndoDelete<string>({
    commit: async (key) => {
      const [kind, id] = key.split(":");
      const result = await removeMemberShelfEntryAction(userId, kind as ShelfList, Number(id));
      if (!result.ok) return { error: result.error ?? "Couldn't remove it." };
      router.refresh();
    },
  });

  // The shelf as the member sees it: held and sent removals taken off.
  const shelf = [...removal.held, ...removal.gone].reduce((acc, key) => {
    const [kind, id] = key.split(":");
    return SHELF_LISTS.includes(kind as ShelfList) ? withoutEntry(acc, kind as ShelfList, Number(id)) : acc;
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
  const onRemove = (list: ShelfList, entryId: number) => {
    setOpen(null);
    setNotice(null);
    removal.hold(heldKey(list, entryId));
  };

  return (
    // `#your-lists` is where "Add it to Now Playing or Completed" (the review
    // composer's locked note) points.
    <div id="your-lists" className="col-span-full flex scroll-mt-5 flex-col gap-2.5 md:mt-4.5">
      <div className="flex flex-wrap items-center gap-2">
        <ShelfSplitButton
          step={nextStep(shelf, shown)}
          rows={shelfRows(shelf, shown, platformName)}
          gameTitle={game.title}
          listLink={listLink}
          onPick={(row) => {
            setNotice(null);
            setOpen({ list: row.list, mode: row.mode, entryId: row.entryId });
          }}
        />
        <ShelfChips chips={shelfChips(shelf, shown)} />
      </div>
      {[...removal.held].map((key) => (
        <UndoBar
          key={key}
          className="max-w-md"
          message={`Removed from ${SHELF_TITLES[key.split(":")[0] as ShelfList]}.`}
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
        onPickCompletion={(entryId) => setOpen({ list: "completed", mode: "edit", entryId })}
      />
    </div>
  );
}
