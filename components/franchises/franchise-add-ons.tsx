"use client";

import type { FranchiseEditor } from "@/hooks/use-franchise-editor";
import type { FranchiseBoard } from "@/hooks/use-franchise-board";
import { SectionHeading } from "@/components/templates/page-header";
import { AddOnDrawer } from "@/components/franchises/add-on-drawer";

// The last section: Add-ons of games outside the Franchise, grouped by
// parent. In edit mode it is the Add-ons drop zone and always shows, empty
// or not: a game dropped here waits at the top while its game is picked.
export function FranchiseAddOns({ board, editor }: { board: FranchiseBoard; editor: FranchiseEditor }) {
  const { strays, incoming } = board.view;
  if (!editor.editing && strays.length === 0) return null;
  const sort = editor.editing ? { item: board.item, onReparent: board.reparent } : {};
  return (
    <section aria-label="Add-ons" className="mt-10">
      <SectionHeading title="Add-ons" count="of games outside this Franchise" />
      <div {...board.zone("addons")} className="mt-4 flex min-h-20 flex-col gap-2.5">
        {incoming.length > 0 && (
          <AddOnDrawer as="div" parent="" heading="Waiting for its game" games={incoming} editor={editor} {...sort} />
        )}
        {strays.map((group) => (
          <AddOnDrawer key={group.key} as="div" parent={group.parent} games={group.games} editor={editor} {...sort} />
        ))}
        {editor.editing && strays.length + incoming.length === 0 && (
          <p className="rounded-sm border border-dashed border-border-strong px-4 py-6 text-dim-foreground">
            Drop a game here to make it an Add-on.
          </p>
        )}
      </div>
    </section>
  );
}
