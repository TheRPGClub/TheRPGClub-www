"use client";

import Link from "next/link";
import { ArrowLeftRight, ArrowUpRight, Undo2, X } from "lucide-react";
import { FRANCHISE_ROLES, type FranchiseRole, type FranchiseRow } from "@/lib/games/game-edit/franchises";
import { LANE_COPY } from "@/lib/games/game-edit/franchise-lanes-copy";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { StagedMark } from "@/components/games/edit/edit-section";

const MARK = { edited: "Edited", added: "Added", removing: "Removing" } as const;

// One Franchise in a role lane (design pick edit-lanes): its name, which
// opens the Franchise, the staged mark with its Undo, Move (to another lane)
// and Unlink (or the x that drops a staged link). Its own component so it
// can grow into the context card (www#208).
export function LaneFranchise({
  row,
  onMove,
  onUnlink,
  onUndo,
}: {
  row: FranchiseRow;
  onMove: (to: FranchiseRole) => void;
  onUnlink: () => void;
  onUndo: () => void;
}) {
  const removing = row.mark === "removing";
  const nameClass = cn(
    "font-headline inline-flex min-w-0 items-center gap-1.5 text-[1.12rem] leading-none break-words",
    removing && "text-faint-foreground line-through decoration-destructive decoration-[1.5px]",
  );
  return (
    <li
      className={cn(
        "flex min-h-12 max-w-full items-center gap-2.5 rounded-sm border bg-card py-1.5 pr-1.5 pl-3.5",
        row.mark && !removing ? "border-highlight bg-highlight/6" : "border-border-strong",
        removing && "border-dashed",
      )}
    >
      {row.franchise_id && row.franchise_id > 0 && !removing ? (
        <Link href={`/franchises/${row.franchise_id}`} target="_blank" title="Open Franchise" className={cn(nameClass, "hover:text-highlight")}>
          {row.name}
          <ArrowUpRight aria-hidden className="size-3.5 flex-none text-dim-foreground" />
          <span className="sr-only">(opens the Franchise in a new tab)</span>
        </Link>
      ) : (
        <span className={nameClass}>{row.name}</span>
      )}
      {row.mark && (
        <span className="flex flex-none items-center gap-2">
          <StagedMark kind={row.mark}>{MARK[row.mark]}</StagedMark>
          <Button variant="inline-link" size="inline" onClick={onUndo} aria-label={`Undo the change to ${row.name}`} className="gap-1 text-[0.8rem]">
            <Undo2 aria-hidden className="mr-0.5 inline size-3.5" />
            Undo
          </Button>
        </span>
      )}
      {!removing && (
        <span className="ml-auto flex flex-none items-center border-l border-border pl-1">
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button type="button" variant="ghost" size="icon-sm" aria-label={`Move ${row.name} to another lane`} />}>
              <ArrowLeftRight />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {FRANCHISE_ROLES.filter((r) => r !== row.role).map((r) => (
                <DropdownMenuItem key={r} onClick={() => onMove(r)}>
                  {LANE_COPY[r].move}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {row.mark === "added" ? (
            <Button variant="ghost" size="icon-sm" aria-label={`Don't link ${row.name}`} onClick={onUndo}>
              <X />
            </Button>
          ) : (
            <Button variant="ghost" size="icon-sm" aria-label={`Unlink ${row.name}`} title="Unlink" onClick={onUnlink}>
              <X />
            </Button>
          )}
        </span>
      )}
    </li>
  );
}
