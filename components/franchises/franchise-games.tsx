"use client";

import { Move, X } from "lucide-react";
import { withGone, type FranchiseLayout } from "@/lib/franchises/page";
import type { FranchiseEditor } from "@/hooks/use-franchise-editor";
import { useFranchiseBoard } from "@/hooks/use-franchise-board";
import { cn } from "@/lib/utils";
import { SectionHeading } from "@/components/templates/page-header";
import { SortStatus } from "@/components/sortable/sort-status";
import { AddOnParentDialog } from "@/components/franchises/add-on-parent-dialog";
import { FranchiseAddOns } from "@/components/franchises/franchise-add-ons";
import { FranchiseWall } from "@/components/franchises/franchise-wall";

// The Games view (design pick 6B): the Mainline run, then the spin-offs in
// the box set, then any Add-ons of games outside the Franchise. In edit mode
// the whole view sits inside a yellow rule, every cover drags between the
// three sections (Make Room) and carries its x, and the box set ends in the
// dashed Link a game tile. Order inside a section is release order.
export function FranchiseGames({
  layout,
  editor,
  addTile,
}: {
  layout: FranchiseLayout;
  editor: FranchiseEditor;
  addTile?: React.ReactNode;
}) {
  const board = useFranchiseBoard(layout, editor);
  const unlinked = editor.editing ? editor.unlinked : [];
  const mainline = withGone(board.view.mainline, unlinked, true);
  const other = withGone(board.view.other, unlinked, false);
  const empty = mainline.length + other.length + board.view.strays.length === 0;
  const sort = editor.editing ? { item: board.item, onReparent: board.reparent } : {};
  const count = (n: number) => `${n} game${n === 1 ? "" : "s"}`;

  return (
    <div className={cn(editor.editing && "rounded-sm p-3 shadow-[inset_0_0_0_2px_var(--color-highlight)] sm:p-4")}>
      {editor.error && !board.picking && (
        <p role="alert" className="mb-3 rounded-sm border-[1.5px] border-dashed border-destructive px-3 py-2 text-[0.92rem]">
          {editor.error}
        </p>
      )}
      {empty && !editor.editing && (
        <p className="rounded-sm border border-dashed border-border-strong px-4 py-6 text-dim-foreground">
          No games are linked to this Franchise yet.
        </p>
      )}
      {/* Editing shows Mainline even empty, so there's somewhere to drop one. */}
      {(mainline.length > 0 || editor.editing) && (
        <section aria-label="Mainline">
          <SectionHeading
            title="Mainline"
            count={`${count(board.view.mainline.length)}, in order`}
            action={editor.editing && <Legend />}
            className="mt-0"
          />
          <div {...board.zone("mainline")} className="mt-4">
            {mainline.length > 0 ? (
              <FranchiseWall entries={mainline} kind="run" editor={editor} {...sort} label="Mainline games, in release order" />
            ) : (
              <p className="rounded-sm border border-dashed border-border-strong px-4 py-6 text-dim-foreground">
                No Mainline games yet. Drag a Spin-off here to make it Mainline.
              </p>
            )}
          </div>
        </section>
      )}
      {(other.length > 0 || editor.editing) && (
        <section aria-label="Spin-offs" className={cn((mainline.length > 0 || editor.editing) && "mt-10")}>
          <SectionHeading title="Spin-offs" count={`${count(board.view.other.length)} · the box set`} />
          <div {...board.zone("other")} className="mt-4 rounded-sm border border-border bg-card px-3 pt-4 pb-5 sm:px-5">
            <FranchiseWall entries={other} kind="box" editor={editor} {...sort} label="Spin-offs" extra={addTile} />
          </div>
        </section>
      )}
      <FranchiseAddOns board={board} editor={editor} />
      {editor.editing && <SortStatus status={board.status} />}
      <AddOnParentDialog
        key={board.picking?.game_id ?? "none"}
        game={board.picking}
        picks={board.picks}
        editor={editor}
        onPick={board.pickParent}
        onCancel={board.cancelPick}
      />
    </div>
  );
}

function Legend() {
  return (
    <span className="flex items-center gap-1.5 text-[0.86rem] text-faint-foreground">
      <Move aria-hidden className="size-3.5" /> Drag between sections ·
      <X aria-hidden className="size-3.5" /> Unlink
    </span>
  );
}
