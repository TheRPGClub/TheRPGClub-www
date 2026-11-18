"use client";

import { useRef } from "react";
import { ImagePlus } from "lucide-react";
import type { HistoryDesk } from "@/hooks/use-history-desk";
import { IMAGES_MAX } from "@/lib/codex/story-schema";
import { IMAGE_ACCEPT } from "@/lib/live-events";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DrawerCard } from "./drawer-card";
import { PinnedPhoto } from "./pinned-photo";

const TILTS = [-2, 1.5, 1, -1.5];

// A History Event's Images card (5D): a plain gallery of up to four pinned,
// numbered photos (the timeline pins them beside the year's chapter), then
// the dashed Add an image slot while there is room.
export function GalleryCard({ desk, tilt }: { desk: HistoryDesk; tilt: number }) {
  const picker = useRef<HTMLInputElement>(null);
  const left = IMAGES_MAX - desk.photos.length;
  return (
    <DrawerCard title="Images" note={`${desk.photos.length} of ${IMAGES_MAX}`} tilt={tilt}>
      <ul className="grid grid-cols-2 gap-x-3.5 gap-y-3">
        {desk.photos.map((photo, i) => (
          <li key={photo.key}>
            <PinnedPhoto
              photo={photo}
              number={i + 1}
              tilt={TILTS[i % TILTS.length]}
              disabled={desk.saving}
              onRemove={() => desk.removePhoto(photo.key)}
              onRetry={() => void desk.save()}
            />
          </li>
        ))}
        {left > 0 && (
          <li>
            <Button
              type="button"
              variant="add"
              size="tile"
              disabled={desk.saving}
              onClick={() => picker.current?.click()}
              className="aspect-[4/3] w-full"
            >
              <ImagePlus aria-hidden />
              Add an image
              <span className="text-[0.75rem] font-medium tracking-normal normal-case">
                {left} of {IMAGES_MAX} left
              </span>
            </Button>
            <Input
              ref={picker}
              type="file"
              accept={IMAGE_ACCEPT}
              multiple
              tabIndex={-1}
              aria-hidden
              className="hidden"
              onChange={(e) => {
                desk.addFiles([...(e.currentTarget.files ?? [])]);
                e.currentTarget.value = "";
              }}
            />
          </li>
        )}
      </ul>
      <p className="mt-3 text-[0.85rem] text-faint-foreground">
        Pinned beside the year on the Club History. JPEG, PNG, WebP or GIF up to 4 MB.
      </p>
    </DrawerCard>
  );
}
