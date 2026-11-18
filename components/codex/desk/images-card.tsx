"use client";

import { useRef } from "react";
import { ImagePlus } from "lucide-react";
import { useEditorRef } from "platejs/react";
import { photoKey, type LoreDesk } from "@/hooks/use-lore-desk";
import { placeAtCaret } from "@/hooks/use-photo-drop";
import { imageIndex } from "@/lib/codex/lore-story";
import { IMAGES_MAX } from "@/lib/codex/story-schema";
import { IMAGE_ACCEPT } from "@/lib/live-events";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DrawerCard } from "./drawer-card";
import { PinnedPhoto } from "./pinned-photo";

const TILTS = [-2, 1.5, 1, -1.5];

// The Images card (5D): the entry's photos pinned up, numbered, each saying
// where it sits in the story, then the dashed Add an image slot while there
// is room. Removing a photo here takes it out of the story too.
export function ImagesCard({ desk, tilt }: { desk: LoreDesk; tilt: number }) {
  const editor = useEditorRef();
  const picker = useRef<HTMLInputElement>(null);
  const left = IMAGES_MAX - desk.photos.length;

  function remove(key: string) {
    const photo = desk.photos.find((p) => p.key === key);
    const at = photo ? imageIndex(editor.children, photoKey(photo)) : -1;
    if (at >= 0) editor.tf.removeNodes({ at: [at] });
    desk.removePhoto(key);
  }

  return (
    <DrawerCard title="Images" note={`${desk.photos.length} of ${IMAGES_MAX}`} tilt={tilt}>
      <ul className="grid grid-cols-2 gap-x-3.5 gap-y-3">
        {desk.photos.map((photo, i) => (
          <li key={photo.key}>
            <PinnedPhoto
              photo={photo}
              number={i + 1}
              tilt={TILTS[i % TILTS.length]}
              value={desk.value}
              disabled={desk.saving}
              onPlace={() => placeAtCaret(editor, photo)}
              onRemove={() => remove(photo.key)}
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
        Drag a photo into the story, or put the caret in a paragraph and use Place at the caret. JPEG, PNG, WebP or GIF up
        to 4 MB.
      </p>
    </DrawerCard>
  );
}
