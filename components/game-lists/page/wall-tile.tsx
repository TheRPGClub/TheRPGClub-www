"use client";

import type { DragEvent } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, GripHorizontal, Pencil, X } from "lucide-react";
import type { GameListEntry, GameListSort } from "@/lib/game-lists/types";
import { addedTag } from "@/lib/game-lists/text";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { GameCover } from "@/components/issue/game-cover";

export interface WallTileEdit {
  first: boolean;
  last: boolean;
  onMove: (step: -1 | 1) => void;
  onNote: () => void;
  onRemove: () => void;
  grip: { draggable: boolean; onDragStart: (e: DragEvent<HTMLElement>) => void; onDragEnd: () => void };
}

// One game on a list's numbered wall (pick 2D): a big cover with its paper
// rank tag pinned on the corner (or the day it was added), its title and
// note under it. Editing adds the control strip under the cover: the grip
// and Move up / Move down on a ranked list, the note's pencil and Remove.
export function WallTile({
  entry,
  place,
  sort,
  now,
  edit,
  dragging,
  landing,
}: {
  entry: GameListEntry;
  place: number;
  sort: GameListSort;
  now: Date;
  edit: WallTileEdit | null;
  dragging: boolean;
  // A dragged cover would land in front of this one.
  landing: boolean;
}) {
  const { game } = entry;
  const ranked = sort === "ranked";
  return (
    <div className={cn("relative", dragging && "opacity-40")}>
      {landing && <span aria-hidden className="absolute top-0 -left-2.5 z-[3] h-full w-0.75 rounded-full bg-highlight sm:-left-3" />}
      {ranked && (
        <span className="font-headline absolute -top-2 -left-1.5 z-[2] -rotate-3 rounded-xs bg-foreground px-2 pt-1.5 pb-1 text-[2rem] leading-[0.85] text-background shadow-[0_6px_14px_rgb(0_0_0/0.45)]">
          {place}
        </span>
      )}
      {sort === "added" && (
        <span className="font-label absolute top-1.5 left-1.5 z-[2] rounded-xs bg-background/86 px-1.5 pt-1 pb-0.5 text-[0.78rem] font-bold tracking-[0.07em]">
          {addedTag(entry.added_at, now)}
        </span>
      )}
      <Link href={`/games/${game.game_id}`} className="block rounded-sm outline-highlight outline-offset-2 focus-visible:outline-2" tabIndex={edit ? -1 : undefined}>
        <GameCover title={game.title} coverUrl={game.cover_url} alt={edit ? undefined : game.title} className="w-full" />
      </Link>
      {edit && <ControlStrip title={game.title} ranked={ranked} edit={edit} />}
      <h3 className="font-headline mt-2.5 text-lg leading-[0.95] sm:text-[1.15rem]">
        <Link href={`/games/${game.game_id}`} className="transition-colors hover:text-highlight">
          {game.title}
        </Link>
      </h3>
      {entry.note && <p className="mt-1.5 line-clamp-4 text-[0.88rem] leading-[1.38] text-dim-foreground">{entry.note}</p>}
    </div>
  );
}

function ControlStrip({ title, ranked, edit }: { title: string; ranked: boolean; edit: WallTileEdit }) {
  const quiet = "aria-disabled:cursor-default aria-disabled:opacity-35 pointer-coarse:size-9";
  return (
    <div className="mt-1.5 flex h-9 items-center justify-between rounded-sm bg-muted px-1 pointer-coarse:h-11">
      {ranked ? (
        <>
          <span
            {...edit.grip}
            title="Drag to move"
            aria-hidden
            className="hidden h-8 w-7 cursor-grab place-items-center text-faint-foreground transition-colors hover:text-foreground active:cursor-grabbing pointer-fine:grid"
          >
            <GripHorizontal className="size-4.5" />
          </span>
          <Button variant="row" size="icon-sm" aria-label={`Move ${title} up`} aria-disabled={edit.first || undefined} onClick={() => !edit.first && edit.onMove(-1)} className={quiet}>
            <ArrowLeft />
          </Button>
          <Button variant="row" size="icon-sm" aria-label={`Move ${title} down`} aria-disabled={edit.last || undefined} onClick={() => !edit.last && edit.onMove(1)} className={quiet}>
            <ArrowRight />
          </Button>
        </>
      ) : (
        <span className="flex-1" />
      )}
      <Button variant="row" size="icon-sm" aria-label={`Note on ${title}`} onClick={edit.onNote} className={quiet}>
        <Pencil />
      </Button>
      <Button variant="destructive-row" size="icon-sm" aria-label={`Remove ${title}`} onClick={edit.onRemove} className={quiet}>
        <X />
      </Button>
    </div>
  );
}
