"use client";

import { Undo2 } from "lucide-react";
import type { FranchiseLanes } from "@/lib/games/game-edit/franchises";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { StagedMark } from "@/components/games/edit/edit-section";

const MARK = { edited: "Edited", added: "Added", removing: "Removing" } as const;

// The Add-on of lane's first line: the game this is an Add-on of, with its
// staged mark and Undo, and Change (another parent). The parent is the
// game's, so it holds in every Franchise in the lane.
export function AddOnParentLine({
  parent,
  onChange,
  onUndo,
}: {
  parent: NonNullable<FranchiseLanes["parent"]>;
  onChange: () => void;
  onUndo: () => void;
}) {
  const removing = parent.mark === "removing";
  return (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[0.95rem] text-dim-foreground">
      <span className="font-label text-[0.76rem] font-bold tracking-[0.08em] text-faint-foreground">Parent game</span>
      <span className={cn("font-semibold text-foreground", removing && "text-faint-foreground line-through decoration-destructive decoration-[1.5px]")}>
        {parent.name}
      </span>
      {parent.mark && (
        <>
          <StagedMark kind={parent.mark}>{MARK[parent.mark]}</StagedMark>
          <Button variant="inline-link" size="inline" onClick={onUndo} aria-label="Undo the change to the parent game" className="gap-1 text-[0.8rem]">
            <Undo2 aria-hidden className="mr-0.5 inline size-3.5" />
            Undo
          </Button>
        </>
      )}
      {!removing && (
        <Button variant="inline-link" size="inline" onClick={onChange} aria-label="Change the parent game" className="text-[0.8rem]">
          Change
        </Button>
      )}
    </p>
  );
}
