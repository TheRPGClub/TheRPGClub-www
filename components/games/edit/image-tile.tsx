"use client";

import { ArrowLeft, ArrowRight, Star, Trash2, Undo2, X } from "lucide-react";
import type { ImageKind } from "@/lib/games/game-edit";
import type { ImageTile as Tile } from "@/lib/games/game-edit/images";
import { cn } from "@/lib/utils";
import { useFilePreview } from "@/hooks/use-file-preview";
import { Button } from "@/components/ui/button";
import { StagedMark } from "@/components/games/edit/edit-section";

export interface ImageTileActions {
  onPrimary: () => void;
  onMove: (by: -1 | 1) => void;
  onDelete: () => void;
  onUnstage: () => void;
}

// One image of a kind (design www#156 round 3): its art with its place
// number and Primary mark, and its tools under it: star, move earlier or
// later, delete. A staged delete is struck through and greyed with an Undo;
// a chosen file is a dashed yellow preview, "Uploads on save", with its
// name and an X.
export function ImageTile({
  tile,
  kind,
  index,
  last,
  actions,
}: {
  tile: Tile;
  kind: ImageKind;
  index: number;
  last: boolean;
  actions: ImageTileActions;
}) {
  const preview = useFilePreview(tile.upload?.file);
  const src = tile.upload ? preview : tile.url;
  const name = tile.upload?.file.name ?? `${kind} ${index + 1}`;
  return (
    <div className={cn("flex flex-col gap-1", kind === "cover" ? "w-25" : "w-42")}>
      <div
        className={cn(
          "relative overflow-hidden rounded-xs bg-muted",
          kind === "cover" ? "aspect-3/4" : "aspect-video",
          tile.upload && "outline-[1.5px] outline-offset-3 outline-highlight outline-dashed",
        )}
      >
        {src && (
          // eslint-disable-next-line @next/next/no-img-element -- remote game art and local previews (blob: URLs), which next/image can't take
          <img
            src={src}
            alt=""
            className={cn(
              "size-full",
              kind === "logo" ? "object-contain p-2.5" : "object-cover",
              tile.deleted && "opacity-30 grayscale",
            )}
          />
        )}
        {tile.deleted && <span aria-hidden className="absolute top-1/2 -right-[10%] -left-[10%] h-0.5 -rotate-24 bg-destructive" />}
        <span className={cn("absolute left-1.5", tile.deleted ? "bottom-1.5" : "top-1.5")}>
          {tile.deleted ? (
            <StagedMark kind="removing">Removing</StagedMark>
          ) : tile.upload ? (
            <StagedMark kind="added">Uploads on save</StagedMark>
          ) : (
            tile.primary && <PrimaryMark />
          )}
        </span>
        {!tile.upload && !tile.deleted && (
          <span className="absolute top-1.5 right-1.5 font-headline text-base leading-none text-foreground [text-shadow:0_1px_8px_rgb(0_0_0/0.85)]">
            {index + 1}
          </span>
        )}
      </div>
      <div className="flex items-center gap-0.5">
        {tile.deleted ? (
          <Button variant="inline-link" size="inline" onClick={actions.onDelete} className="gap-1 text-[0.8rem]">
            <Undo2 aria-hidden className="mr-1 inline size-3.5" />
            Undo
          </Button>
        ) : tile.upload ? (
          <>
            <span className="min-w-0 flex-1 truncate text-[0.74rem] text-faint-foreground">{tile.upload.file.name}</span>
            {tile.primary || <Tool label={`Make ${name} primary`} onClick={actions.onPrimary} icon={<Star />} />}
            <Tool label={`Don't upload ${name}`} onClick={actions.onUnstage} icon={<X />} />
          </>
        ) : (
          <>
            <Tool label={`Make ${name} primary`} pressed={tile.primary} onClick={actions.onPrimary} icon={<Star className={cn(tile.primary && "fill-current text-highlight")} />} />
            <Tool label={`Move ${name} earlier`} disabled={index === 0} onClick={() => actions.onMove(-1)} icon={<ArrowLeft />} />
            <Tool label={`Move ${name} later`} disabled={last} onClick={() => actions.onMove(1)} icon={<ArrowRight />} />
            <span className="ml-auto" />
            <Tool label={`Delete ${name}`} onClick={actions.onDelete} icon={<Trash2 />} />
          </>
        )}
      </div>
    </div>
  );
}

function Tool(p: { label: string; icon: React.ReactNode; onClick: () => void; disabled?: boolean; pressed?: boolean }) {
  return (
    <Button
      type="button"
      variant="tool"
      size="icon-sm"
      aria-label={p.label}
      title={p.label}
      aria-pressed={p.pressed}
      disabled={p.disabled}
      onClick={p.onClick}
    >
      {p.icon}
    </Button>
  );
}

function PrimaryMark() {
  return (
    <span className="font-label inline-flex items-center gap-1 rounded-xs bg-foreground px-1.5 pt-1 pb-[3px] text-[0.72rem] leading-none font-extrabold tracking-[0.07em] text-background">
      <Star aria-hidden className="size-2.75 fill-current" />
      Primary
    </span>
  );
}
