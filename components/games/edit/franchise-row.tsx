"use client";

import Link from "next/link";
import { Undo2, Unlink, X } from "lucide-react";
import type { FranchiseRow } from "@/lib/games/game-edit/franchises";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { StagedMark } from "@/components/games/edit/edit-section";

const MARK = { edited: "Edited", added: "Added", removing: "Removing" } as const;

// One Franchise on the Franchises tab (design pick 7A): its name (linking to
// its page), the Mainline / Other control hugging its two words, the staged
// mark with its Undo, and Unlink (or the x that drops a staged link).
export function FranchiseRowItem({
  row,
  onMainline,
  onUnlink,
  onUndo,
}: {
  row: FranchiseRow;
  onMainline: (mainline: boolean) => void;
  onUnlink: () => void;
  onUndo: () => void;
}) {
  const removing = row.mark === "removing";
  const nameClass = cn(
    "font-headline min-w-0 text-[1.2rem] leading-none break-words",
    removing && "text-faint-foreground line-through decoration-destructive decoration-[1.5px]",
  );
  return (
    <li
      className={cn(
        "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2.5 border-b border-border py-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(9rem,auto)_auto]",
        row.mark && !removing && "bg-highlight/6 px-2.5",
      )}
    >
      {row.franchise_id && row.mark !== "added" && !removing ? (
        <Link href={`/franchises/${row.franchise_id}`} className={cn(nameClass, "hover:text-highlight")}>
          {row.name}
        </Link>
      ) : (
        <span className={nameClass}>{row.name}</span>
      )}
      <ToggleGroup
        variant="outline"
        size="sm"
        spacing={0}
        aria-label={`${row.name}: this game is`}
        value={[row.mainline ? "mainline" : "other"]}
        disabled={removing}
        onValueChange={(value) => value[0] && onMainline(value[0] === "mainline")}
        className="col-start-1 row-start-2 sm:col-start-2 sm:row-start-1"
      >
        <ToggleGroupItem value="mainline" className="px-3">
          Mainline
        </ToggleGroupItem>
        <ToggleGroupItem value="other" className="px-3">
          Other
        </ToggleGroupItem>
      </ToggleGroup>
      <span className="col-start-2 row-start-2 flex items-center justify-end gap-2.5 sm:col-start-3 sm:row-start-1 sm:justify-start">
        {row.mark && (
          <>
            <StagedMark kind={row.mark}>{MARK[row.mark]}</StagedMark>
            <Button variant="inline-link" size="inline" onClick={onUndo} aria-label={`Undo the change to ${row.name}`} className="gap-1 text-[0.8rem]">
              <Undo2 aria-hidden className="mr-1 inline size-3.5" />
              Undo
            </Button>
          </>
        )}
      </span>
      <span className="col-start-2 row-start-1 flex justify-end sm:col-start-4">
        {row.mark === "added" ? (
          <Button variant="ghost" size="icon-xs" aria-label={`Don't link ${row.name}`} onClick={onUndo}>
            <X />
          </Button>
        ) : (
          !removing && (
            <Button variant="ghost" size="sm" aria-label={`Unlink ${row.name}`} onClick={onUnlink}>
              <Unlink data-icon="inline-start" />
              Unlink
            </Button>
          )
        )}
      </span>
    </li>
  );
}
