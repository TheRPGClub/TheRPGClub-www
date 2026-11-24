"use client";

import { useState } from "react";
import type { FranchiseEntry } from "@/lib/franchises/page";
import type { FranchiseEditor } from "@/hooks/use-franchise-editor";
import { cn } from "@/lib/utils";
import { FranchiseTile } from "@/components/franchises/franchise-tile";
import { AddOnDrawer } from "@/components/franchises/add-on-drawer";

type WallEntry = FranchiseEntry & { gone: boolean };

// A wall of the Franchise's covers (design pick 6B). "run" is the Mainline
// run: big covers, each over its Roman numeral in Anton and its year. "box"
// is the box set of Other games: smaller covers with their titles. An open
// Add-on insert slides its drawer in under the row of its parent (the grid
// packs dense, so the row closes up around it).
export function FranchiseWall({
  entries,
  kind,
  editor,
  label,
  extra,
}: {
  entries: WallEntry[];
  kind: "run" | "box";
  editor: FranchiseEditor;
  label: string;
  // A last tile (Link a game, in edit mode).
  extra?: React.ReactNode;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const run = kind === "run";
  return (
    <ul
      aria-label={label}
      className={cn(
        "grid grid-flow-row-dense",
        run
          ? "grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-5 lg:grid-cols-8 lg:gap-x-3.5"
          : "grid-cols-3 gap-x-2.5 gap-y-3.5 sm:grid-cols-6 lg:grid-cols-10",
      )}
    >
      {entries.flatMap((e) => {
        const tile = (
          <FranchiseTile
            key={e.game_id}
            game={e}
            editor={editor}
            gone={e.gone}
            addOns={e.addOns.length}
            open={open === e.game_id}
            onToggleAddOns={() => setOpen(open === e.game_id ? null : e.game_id)}
            fallbackClassName={run ? "p-2 text-[1rem]" : "p-1.5 text-[0.8rem]"}
            caption={run ? <RunCaption entry={e} /> : <BoxCaption entry={e} />}
          />
        );
        if (open !== e.game_id || e.addOns.length === 0) return [tile];
        return [tile, <AddOnDrawer key={`drawer-${e.game_id}`} parent={e.title} games={e.addOns} editor={editor} />];
      })}
      {extra && <li className="min-w-0">{extra}</li>}
    </ul>
  );
}

function RunCaption({ entry }: { entry: WallEntry }) {
  return (
    <p className="mt-1.5 flex items-baseline justify-between gap-1.5">
      <b className="font-headline text-[1.35rem] leading-[0.9] font-normal sm:text-[1.7rem]">{entry.numeral ?? ""}</b>
      <span className="text-[0.82rem] text-faint-foreground">{entry.release_year ?? "TBA"}</span>
    </p>
  );
}

function BoxCaption({ entry }: { entry: WallEntry }) {
  return (
    <p className="mt-1.5 text-[0.78rem] leading-[1.2] text-dim-foreground">
      <span className="line-clamp-2">{entry.title}</span>
      <small className="block text-[0.72rem] text-faint-foreground">{entry.release_year ?? "TBA"}</small>
    </p>
  );
}
