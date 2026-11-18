"use client";

import { CornerDownRight, RotateCcw, X } from "lucide-react";
import type { Value } from "platejs";
import { photoKey, type DeskPhoto } from "@/hooks/use-desk-photos";
import { PHOTO_DRAG_TYPE } from "@/hooks/use-photo-drop";
import { paragraphBefore } from "@/lib/codex/lore-story";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// One photo in the drawer (5D): pinned at a tilt with its number and a
// remove x, the line saying where it sits in the story, and Place at the
// caret. While it uploads it wears the ink overlay; when the upload fails it
// keeps its slot, outlined in signal orange, with the reason, Retry and
// Remove. In a plain gallery (a History Event's, www#126: no `onPlace`) it
// has no place in the text, so no story line, no Place at the caret and no
// drag.
export function PinnedPhoto({
  photo,
  number,
  tilt,
  value,
  disabled,
  onPlace,
  onRemove,
  onRetry,
}: {
  photo: DeskPhoto;
  number: number;
  tilt: number;
  value?: Value;
  disabled: boolean;
  onPlace?: () => void;
  onRemove: () => void;
  onRetry: () => void;
}) {
  const after = value ? paragraphBefore(value, photoKey(photo)) : null;
  const failed = photo.state === "failed";
  return (
    <div>
      <div
        draggable={!disabled && !!onPlace}
        onDragStart={(e) => {
          e.dataTransfer.setData(PHOTO_DRAG_TYPE, photo.key);
          e.dataTransfer.effectAllowed = "move";
        }}
        style={{ "--tilt": `${tilt}deg` } as React.CSSProperties}
        className={cn(
          "relative aspect-[4/3] overflow-hidden rounded-[2px] bg-background shadow-[0_6px_14px_rgb(0_0_0/0.45)] lg:rotate-(--tilt)",
          onPlace && "cursor-grab active:cursor-grabbing",
          failed && "outline-2 outline-offset-2 outline-destructive",
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- an uploaded photo or a local preview (blob:), which next/image can't load */}
        <img src={photo.url} alt={`Photo ${number}`} className="size-full object-cover" draggable={false} />
        <span className="font-headline absolute top-1.5 left-1.5 rounded-[2px] bg-background/85 px-1.5 py-0.5 text-[0.94rem] leading-none">
          {number}
        </span>
        <Button
          type="button"
          variant="cover-remove"
          size="icon-xs"
          aria-label={`Remove photo ${number}`}
          disabled={disabled}
          onClick={onRemove}
          className="absolute top-1 right-1"
        >
          <X />
        </Button>
        {photo.state === "uploading" && (
          <div className="absolute inset-0 flex flex-col justify-end gap-1.5 bg-background/84 p-2.5" role="status">
            <span className="font-label text-[0.75rem] font-bold tracking-[0.08em] text-dim-foreground">Uploading</span>
            <span className="relative h-1 overflow-hidden rounded-full bg-foreground/20">
              <span className="absolute inset-y-0 left-0 w-1/3 bg-foreground motion-safe:animate-[codex-upload_1.1s_ease-in-out_infinite]" />
            </span>
          </div>
        )}
      </div>
      {failed ? (
        <div className="mt-2 text-[0.8rem] leading-snug text-destructive">
          <p>{photo.error ?? "It didn't upload."}</p>
          <div className="mt-1 flex gap-1">
            <Button type="button" variant="quiet-link" size="xs" onClick={onRetry} disabled={disabled}>
              <RotateCcw aria-hidden />
              Retry
            </Button>
            <Button type="button" variant="quiet-link" size="xs" onClick={onRemove} disabled={disabled}>
              Remove
            </Button>
          </div>
        </div>
      ) : onPlace ? (
        <>
          <p
            className={cn(
              "font-label mt-2 text-[0.72rem] font-bold tracking-[0.08em]",
              after === null ? "text-destructive" : "text-faint-foreground",
            )}
          >
            {after === null ? "Not in the story" : after === 0 ? "Before the story" : `After paragraph ${after}`}
          </p>
          <Button type="button" variant="quiet-link" size="xs" onClick={onPlace} disabled={disabled} className="-ml-2">
            <CornerDownRight aria-hidden />
            Place at the caret
          </Button>
        </>
      ) : null}
    </div>
  );
}
