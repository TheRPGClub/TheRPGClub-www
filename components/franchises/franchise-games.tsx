"use client";

import { Star, X } from "lucide-react";
import { withGone, type FranchiseLayout } from "@/lib/franchises/page";
import type { FranchiseEditor } from "@/hooks/use-franchise-editor";
import { cn } from "@/lib/utils";
import { SectionHeading } from "@/components/templates/page-header";
import { AddOnDrawer } from "@/components/franchises/add-on-drawer";
import { FranchiseWall } from "@/components/franchises/franchise-wall";

// The Games view (design pick 6B): the Mainline run, then the spin-offs in
// the box set, then any Add-ons of games outside the Franchise. In edit mode
// the whole view sits inside a yellow rule, every cover carries its star and
// x, and the box set ends in the dashed Link a game tile.
export function FranchiseGames({
  layout,
  editor,
  addTile,
}: {
  layout: FranchiseLayout;
  editor: FranchiseEditor;
  addTile?: React.ReactNode;
}) {
  const mainline = withGone(layout.mainline, editor.editing ? editor.unlinked : [], true);
  const other = withGone(layout.other, editor.editing ? editor.unlinked : [], false);
  const empty = mainline.length + other.length + layout.strays.length === 0;

  return (
    <div className={cn(editor.editing && "rounded-sm p-3 shadow-[inset_0_0_0_2px_var(--color-highlight)] sm:p-4")}>
      {editor.error && (
        <p role="alert" className="mb-3 rounded-sm border-[1.5px] border-dashed border-destructive px-3 py-2 text-[0.92rem]">
          {editor.error}
        </p>
      )}
      {empty && !editor.editing && (
        <p className="rounded-sm border border-dashed border-border-strong px-4 py-6 text-dim-foreground">
          No games are linked to this Franchise yet.
        </p>
      )}
      {mainline.length > 0 && (
        <section aria-label="Mainline">
          <SectionHeading
            title="Mainline"
            count={`${layout.counts.mainline} game${layout.counts.mainline === 1 ? "" : "s"}, in order`}
            action={editor.editing && <Legend />}
            className="mt-0"
          />
          <div className="mt-4">
            <FranchiseWall entries={mainline} kind="run" editor={editor} label="Mainline games, in release order" />
          </div>
        </section>
      )}
      {(other.length > 0 || editor.editing) && (
        <section aria-label="Spin-offs" className={cn(mainline.length > 0 && "mt-10")}>
          <SectionHeading title="Spin-offs" count={`${layout.counts.other} game${layout.counts.other === 1 ? "" : "s"} · the box set`} />
          <div className="mt-4 rounded-sm border border-border bg-card px-3 pt-4 pb-5 sm:px-5">
            <FranchiseWall entries={other} kind="box" editor={editor} label="Spin-offs" extra={addTile} />
          </div>
        </section>
      )}
      {layout.strays.length > 0 && (
        <section aria-label="Add-ons of other games" className="mt-10">
          <SectionHeading title="Add-ons" count="of games outside this Franchise" />
          <div className="mt-4 flex flex-col gap-2.5">
            {layout.strays.map((group) => (
              <AddOnDrawer
                key={group.parent?.game_id ?? "none"}
                as="div"
                parent={group.parent?.title ?? group.games[0]?.parent_game_name ?? "A game not in GameDB"}
                games={group.games}
                editor={editor}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Legend() {
  return (
    <span className="flex items-center gap-1.5 text-[0.86rem] text-faint-foreground">
      <Star aria-hidden className="size-3.5" /> Mainline ·
      <X aria-hidden className="size-3.5" /> Unlink
    </span>
  );
}
