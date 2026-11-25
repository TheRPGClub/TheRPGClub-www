"use client";

import Link from "next/link";
import { ArrowUpRight, Undo2 } from "lucide-react";
import type { FranchiseRole, FranchiseRow, GameParent } from "@/lib/games/game-edit/franchises";
import { countsLine, franchiseCardRun, franchiseCounts, type CardGame } from "@/lib/games/game-edit/franchise-card";
import type { FranchiseRunRead } from "@/hooks/use-franchise-runs";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StagedMark } from "@/components/games/edit/edit-section";
import { FranchiseRunStrip } from "@/components/games/edit/franchise-lanes/franchise-run-strip";
import { LaneMoveMenu } from "@/components/games/edit/franchise-lanes/lane-move-menu";

const MARK = { edited: "Edited", added: "Added", removing: "Removing" } as const;

// One Franchise in a role lane as a context card (design picks edit-lanes +
// edit-cards, www#208): its name and game count, the staged mark with its
// Undo, Open Franchise (a new tab, so staged edits survive), Move and
// Unlink; below, its run in the lane's role with this game in place. The
// run loads on its own (`read`); a failed read, or a Franchise leaving,
// leaves the plain row. A new Franchise (no id) runs to this game alone.
export function LaneFranchise({
  row,
  read,
  game,
  parent,
  onMove,
  onUnlink,
  onUndo,
}: {
  row: FranchiseRow;
  read: FranchiseRunRead | null;
  game: CardGame;
  parent: GameParent | null;
  onMove: (to: FranchiseRole) => void;
  onUnlink: () => void;
  onUndo: () => void;
}) {
  const removing = row.mark === "removing";
  const page = read?.status === "ok" ? read.page : null;
  const plain = removing || read?.status === "failed";
  const staged = row.mark && !removing;
  return (
    <li
      className={cn(
        "overflow-hidden rounded-sm border bg-card",
        staged ? "border-highlight/55" : "border-border-strong",
        removing && "border-dashed",
      )}
    >
      <div className={cn("flex flex-wrap items-center gap-x-3.5 gap-y-1.5 py-2.5 pr-2 pl-4 sm:pl-5", !plain && "border-b border-border", staged && "bg-highlight/5")}>
        <h4 className={cn("font-headline min-w-0 text-[1.45rem] leading-none break-words", removing && "text-faint-foreground line-through decoration-destructive decoration-[1.5px]")}>
          {row.name}
        </h4>
        {page && <span className="font-label text-[0.78rem] font-bold tracking-[0.08em] text-faint-foreground">{countsLine(franchiseCounts(page))}</span>}
        {!page && !plain && row.franchise_id && <Skeleton className="h-3 w-40" />}
        {row.franchise_id == null && <span className="font-label text-[0.78rem] font-bold tracking-[0.08em] text-faint-foreground">New Franchise</span>}
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
          <span className="ml-auto flex flex-none items-center gap-1">
            {row.franchise_id != null && row.franchise_id > 0 && (
              <Link
                href={`/franchises/${row.franchise_id}`}
                target="_blank"
                className="font-label mr-2 inline-flex items-center gap-1 text-[0.8rem] font-extrabold tracking-[0.08em] underline decoration-border-strong underline-offset-4 hover:text-highlight hover:decoration-highlight"
              >
                Open Franchise
                <ArrowUpRight aria-hidden className="size-3.5" />
                <span className="sr-only">(opens {row.name} in a new tab)</span>
              </Link>
            )}
            <LaneMoveMenu name={row.name} role={row.role} onMove={onMove} />
            <Button variant="ghost" size="sm" onClick={row.mark === "added" ? onUndo : onUnlink} aria-label={row.mark === "added" ? `Don't link ${row.name}` : `Unlink ${row.name}`}>
              Unlink
            </Button>
          </span>
        )}
      </div>
      {!plain &&
        (read?.status === "loading" ? (
          <div aria-busy className="flex gap-3 px-4 pt-11 pb-9 sm:px-5">
            <span className="sr-only">Loading {row.name}’s games</span>
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="aspect-[3/4] w-[3.9rem] flex-none" />
            ))}
          </div>
        ) : (
          <FranchiseRunStrip run={franchiseCardRun(page, row.role, game, parent)} franchise={row.name} title={game.title} />
        ))}
    </li>
  );
}
