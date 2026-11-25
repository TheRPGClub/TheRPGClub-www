"use client";

import { useState, useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { listGameImagesAction, refreshGameImagesAction } from "@/app/actions/game-images";
import type { GameImageEntry, ImageKind, ImagesStage } from "@/lib/games/game-edit";
import { imagesUntouched } from "@/lib/games/game-edit/images";
import { Button } from "@/components/ui/button";
import { EditSection } from "@/components/games/edit/edit-section";
import { ImageKindSection } from "@/components/games/edit/image-kind";

const KINDS: [ImageKind, string, string][] = [
  ["cover", "Covers", "Add a cover"],
  ["artwork", "Key art", "Add key art"],
  ["logo", "Logo", "Add a logo"],
];

// The Images tab (www#158, design www#156 round 3): the game's images by
// kind, each kind with its own add. Uploads, stars, drags and deletes stage;
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
      {KINDS.map(([kind, title, add]) => (
        <ImageKindSection key={kind} kind={kind} title={title} add={add} loaded={loaded} stage={stage} set={set} onNote={setNote} />
      ))}
    </EditSection>
  );
}
