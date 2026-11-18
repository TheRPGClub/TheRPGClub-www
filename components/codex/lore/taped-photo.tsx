"use client";

import { captionParts, type SpreadPhoto } from "@/lib/codex/lore-story";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

function Caption({ caption }: { caption: string }) {
  const { label, text } = captionParts(caption);
  return (
    <>
      {label && <b className="font-label mr-1.5 text-[0.75rem] font-extrabold tracking-[0.08em] text-codex-lore-print not-italic">{label}</b>}
      {text}
    </>
  );
}

// A photo taped into the Lore Entry's margin (3D): on a paper mount, tilted,
// a strip of parchment tape across its top, its caption under it. It opens
// full size, with its caption, on click or Enter.
export function TapedPhoto({ photo, number }: { photo: SpreadPhoto; number: number }) {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            variant="frame"
            size="bare"
            aria-label={photo.caption ? `Open photo: ${photo.caption}` : `Open photo ${number}`}
            style={{ "--tilt": `${photo.tilt}deg` } as React.CSSProperties}
            className="group/photo relative block w-full max-w-[86%] rotate-[calc(var(--tilt)/2)] text-left motion-safe:transition-transform motion-safe:duration-200 motion-safe:hover:rotate-0 lg:max-w-[300px] lg:rotate-(--tilt)"
          />
        }
      >
        <span className="block rounded-[2px] bg-foreground px-2.5 pt-2.5 pb-3 text-background shadow-[0_14px_30px_rgb(0_0_0/0.55)]">
          <span
            aria-hidden
            className="absolute -top-3 left-1/2 h-6 w-23 -translate-x-1/2 rotate-[calc(var(--tilt)*-2)] bg-codex-history/72 shadow-[0_1px_2px_rgb(0_0_0/0.2)]"
          />
          {/* eslint-disable-next-line @next/next/no-img-element -- an uploaded image on the club's image store, which next/image isn't configured for */}
          <img src={photo.url} alt={photo.caption ?? ""} loading="lazy" className="block max-h-80 w-full bg-muted object-cover" />
          {photo.caption && (
            <span className="mt-2 block text-[0.9rem] leading-snug font-medium italic">
              <Caption caption={photo.caption} />
            </span>
          )}
        </span>
      </DialogTrigger>
      <DialogContent className="max-w-[min(64rem,calc(100%-2rem))] gap-3">
        <DialogTitle className="sr-only">{photo.caption ?? `Photo ${number}`}</DialogTitle>
        {/* eslint-disable-next-line @next/next/no-img-element -- the same uploaded image at full size */}
        <img src={photo.url} alt={photo.caption ?? ""} className="mx-auto max-h-[78dvh] w-auto max-w-full object-contain" />
        {photo.caption && (
          <p className="text-[0.95rem] italic text-dim-foreground">
            <Caption caption={photo.caption} />
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
