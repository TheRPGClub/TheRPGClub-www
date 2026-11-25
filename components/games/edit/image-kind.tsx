"use client";

import type { GameImageEntry, ImageKind, ImagesStage } from "@/lib/games/game-edit";
import {
  imageKindView,
  orderImages,
  setPrimaryImage,
  stageImageUpload,
  toggleImageDelete,
  unstageImageUpload,
} from "@/lib/games/game-edit/images";
import { useSortable } from "@/hooks/use-sortable";
import { SortStatus } from "@/components/sortable/sort-status";
import { ImageTile } from "@/components/games/edit/image-tile";
import { AddImage } from "@/components/games/edit/add-image";

// One kind on the Images tab: its title and add, and its images. Drag an
// image to put it elsewhere in its kind (a kind is its own sortable, so an
// image never changes kind); the new order stages like the rest. Pending
// uploads sit after the placed images and don't move.
export function ImageKindSection({
  kind,
  title,
  add,
  loaded,
  stage,
  set,
  onNote,
}: {
  kind: ImageKind;
  title: string;
  add: string;
  loaded: GameImageEntry[];
  stage: ImagesStage;
  set: (next: ImagesStage) => void;
  onNote: (note: string | null) => void;
}) {
  const tiles = imageKindView(loaded, stage, kind);
  const placed = tiles.filter((t) => !t.upload);
  const uploads = tiles.filter((t) => t.upload);
  const byRef = new Map(placed.map((t) => [t.ref as number, t]));
  const s = useSortable({
    zones: { [kind]: placed.map((t) => t.ref as number) } as Record<ImageKind, number[]>,
    layout: "grid",
    disabled: placed.length < 2,
    name: (id) => `${kind} ${placed.findIndex((t) => t.ref === id) + 1}`,
    onDrop: (next) => set(orderImages(loaded, stage, kind, next[kind])),
  });
  const order = s.zones[kind];

  const tile = (t: (typeof tiles)[number], i: number) => (
    <ImageTile
      key={t.ref}
      tile={t}
      kind={kind}
      index={i}
      actions={{
        onPrimary: () => set(setPrimaryImage(loaded, stage, kind, t.ref)),
        onDelete: () => typeof t.ref === "number" && set(toggleImageDelete(stage, t.ref)),
        onUnstage: () => set(unstageImageUpload(stage, String(t.ref))),
      }}
      sortable={t.upload ? undefined : s.item(t.ref as number)}
    />
  );

  return (
    <div className="border-t border-border pb-3 first:border-t-0">
      <div className="flex items-center gap-3 pt-2.5 pb-2">
        <h3 className="font-headline text-[1.2rem] leading-none uppercase">{title}</h3>
        <span className="ml-auto" />
        <AddImage kind={kind} label={add} onNote={onNote} onPick={(file, key) => set(stageImageUpload(stage, { key, kind, file }))} />
      </div>
      {tiles.length === 0 ? (
        <p className="text-[0.9rem] text-faint-foreground">None yet.</p>
      ) : (
        <div {...s.zone(kind)} className="flex flex-wrap items-start gap-x-3 gap-y-2.5">
          {order.map((id, i) => {
            const t = byRef.get(id);
            return t ? tile(t, i) : null;
          })}
          {uploads.map((t, i) => tile(t, order.length + i))}
        </div>
      )}
      {placed.length > 1 && <SortStatus status={s.status} />}
    </div>
  );
}
