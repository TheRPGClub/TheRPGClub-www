"use client";

import { Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UndoBar } from "@/components/admin/desk/undo-bar";
import type { ShelfManage } from "@/hooks/use-shelf-manage";
import { cn } from "@/lib/utils";

// Where a removed entry stood while its Undo runs (spec api#451, pick 3A):
// a signal-orange dashed hole the size of its picture, with Undo in it, and
// its title struck through.
export function RemovedHole({
  title,
  onUndo,
  wide,
  className,
}: {
  title: string;
  onUndo: () => void;
  // Now Playing's wide key art rather than a 3:4 cover.
  wide?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col", className)}>
      <div
        className={cn(
          "grid place-items-center rounded-sm outline-[1.5px] -outline-offset-[1.5px] outline-destructive outline-dashed",
          wide ? "aspect-video" : "aspect-[3/4]",
        )}
      >
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onUndo}
          aria-label={`Undo removing ${title}`}
        >
          <Undo2 data-icon="inline-start" aria-hidden />
          Undo
        </Button>
      </div>
      <p className="font-label mt-1.5 line-clamp-2 text-[0.8rem] leading-tight font-bold text-destructive line-through">
        {title}
      </p>
    </div>
  );
}

// The Undo lines for every removal still held on a list page, each with
// its draining bar, and a refused removal's reason.
export function UndoLines({
  manage,
  listName,
  className,
}: {
  manage: ShelfManage;
  listName: string;
  className?: string;
}) {
  const { undo } = manage;
  if (manage.held.length === 0 && undo.errors.size === 0) return null;
  return (
    <div className={cn("space-y-2", className)}>
      {manage.held.map((entryId) => (
        <UndoBar
          key={entryId}
          message={
            <>
              <b className="text-foreground">{manage.titleOf(entryId)}</b>{" "}
              removed from {listName}.
            </>
          }
          delayMs={undo.delayMs}
          onUndo={() => undo.undo(entryId)}
        />
      ))}
      {[...undo.errors].map(([entryId, error]) => (
        <p
          key={entryId}
          role="alert"
          className="text-[0.84rem] text-destructive"
        >
          Couldn&apos;t remove {manage.titleOf(entryId)}: {error}
        </p>
      ))}
    </div>
  );
}
