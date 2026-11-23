"use client";

import { useState, useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { listGameImagesAction, refreshGameImagesAction } from "@/app/actions/game-images";
import type { GameImageEntry, ImageKind, ImagesStage } from "@/lib/games/game-edit";
import {
  imageKindView,
  imagesUntouched,
  moveImage,
  setPrimaryImage,
  stageImageUpload,
  toggleImageDelete,
  unstageImageUpload,
} from "@/lib/games/game-edit/images";
import { Button } from "@/components/ui/button";
import { EditSection } from "@/components/games/edit/edit-section";
import { ImageTile } from "@/components/games/edit/image-tile";
import { AddImage } from "@/components/games/edit/add-image";

const KINDS: [ImageKind, string, string][] = [
  ["cover", "Covers", "Add a cover"],
  ["artwork", "Key art", "Add key art"],
  ["logo", "Logo", "Add a logo"],
];

// The Images tab (www#158, design www#156 round 3): the game's images by
// kind, each kind with its own add. Uploads, stars, moves and deletes stage;
// Refresh from IGDB runs at once, and only with nothing staged here.
export function ImagesTab({
  gameId,
  loaded,
  staged,
  error,
  onStage,
  onReload,
}: {
  gameId: number;
  loaded: GameImageEntry[];
  staged: ImagesStage | undefined;
  error?: string;
  onStage: (next: ImagesStage | undefined) => void;
  onReload: (images: GameImageEntry[]) => void;
}) {
  const stage = staged ?? {};
  const dirty = !imagesUntouched(stage);
  const set = (next: ImagesStage) => onStage(imagesUntouched(next) ? undefined : next);
  const [note, setNote] = useState<string | null>(null);
  const [refreshing, startRefresh] = useTransition();

  function refresh() {
    setNote(null);
    startRefresh(async () => {
      const result = await refreshGameImagesAction(gameId);
      const fresh = await listGameImagesAction(gameId);
      if (fresh) onReload(fresh);
      setNote(result.ok ? "Refreshed from IGDB." : result.error);
    });
  }

  const refreshButton = (
    <>
      {note && <span role="status" className="text-[0.82rem] text-faint-foreground">{note}</span>}
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={dirty || refreshing}
        title={dirty ? "Save or discard the image changes first" : undefined}
        onClick={refresh}
      >
        <RefreshCw className={refreshing ? "animate-spin" : undefined} />
        {refreshing ? "Refreshing" : "Refresh from IGDB"}
      </Button>
    </>
  );

  return (
    <EditSection title="Images" actions={refreshButton} error={error}>
      {KINDS.map(([kind, title, add]) => {
        const tiles = imageKindView(loaded, stage, kind);
        const placed = tiles.filter((t) => !t.upload).length;
        return (
          <div key={kind} className="border-t border-border pb-3 first:border-t-0">
            <div className="flex items-center gap-3 pt-2.5 pb-2">
              <h3 className="font-headline text-[1.2rem] leading-none uppercase">{title}</h3>
              <span className="ml-auto" />
              <AddImage kind={kind} label={add} onNote={setNote} onPick={(file, key) => set(stageImageUpload(stage, { key, kind, file }))} />
            </div>
            {tiles.length === 0 ? (
              <p className="text-[0.9rem] text-faint-foreground">None yet.</p>
            ) : (
              <div className="flex flex-wrap items-start gap-x-3 gap-y-2.5">
                {tiles.map((tile, i) => (
                  <ImageTile
                    key={tile.ref}
                    tile={tile}
                    kind={kind}
                    index={i}
                    last={i === placed - 1}
                    actions={{
                      onPrimary: () => set(setPrimaryImage(loaded, stage, kind, tile.ref)),
                      onMove: (by) => typeof tile.ref === "number" && set(moveImage(loaded, stage, kind, tile.ref, by)),
                      onDelete: () => typeof tile.ref === "number" && set(toggleImageDelete(stage, tile.ref)),
                      onUnstage: () => set(unstageImageUpload(stage, String(tile.ref))),
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </EditSection>
  );
}
