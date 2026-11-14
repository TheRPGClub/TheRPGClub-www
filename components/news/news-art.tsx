"use client";

import { useState, type CSSProperties } from "react";
import { artFrames, type NewsFrame } from "@/lib/news";
import { cn } from "@/lib/utils";
import { ArtFallback, ArtFrame } from "./news-art-frame";

// A card's 16:9 art box: its frames (the outside page's image, or up to four
// attachments laid out as a contact sheet), a 4px foot bar and the corner tag
// in the News Category's ink. With a `cover`, the first frame (the outside
// page's image) shows alone; if it fails the attachments take its place.
//
// Outside images load straight from their own address (not through the
// image optimiser) and send no referrer. A frame that fails to load is
// dropped, and with none left the box falls back to the headline in Anton on
// ink-3, so a broken image shows nothing and leaves no hole. A frame the API
// marks unavailable (an expired attachment the bot is renewing) reads "Image
// loading".

export function NewsArt({
  frames,
  cover,
  href,
  framesOpen,
  fallback,
  tag,
  tagTitle,
  ink,
  dashed,
}: {
  frames: NewsFrame[];
  cover: boolean;
  // The outside page, for a link News Item: the art leads there too (out of
  // the tab order; the headline is the link).
  href: string | null;
  // Each frame opens its own image full size (image-only News Items).
  framesOpen: boolean;
  fallback: string;
  tag: string;
  tagTitle: string;
  ink: string;
  dashed: boolean;
}) {
  const [failed, setFailed] = useState<ReadonlySet<number>>(() => new Set());
  const fail = (i: number) =>
    setFailed((prev) => (prev.has(i) ? prev : new Set(prev).add(i)));
  const { visible, shown, extra } = artFrames(frames, cover, failed);

  return (
    <div
      style={{ "--news-ink": ink } as CSSProperties}
      className={cn(
        "relative aspect-video overflow-hidden border-b-4 border-(--news-ink) bg-muted",
        dashed && "border-dashed",
      )}
    >
      {visible.length === 0 ? (
        <ArtFallback text={fallback} />
      ) : (
        <div
          className={cn(
            "grid size-full gap-0.5",
            visible.length > 1 && "grid-cols-2",
            visible.length > 2 && "grid-rows-2",
          )}
        >
          {visible.map(({ frame, i }, n) => (
            <div
              key={i}
              className={cn(
                "relative min-h-0 overflow-hidden",
                visible.length === 3 && n === 0 && "row-span-2",
              )}
            >
              <ArtFrame
                frame={frame}
                n={n}
                count={shown}
                small={visible.length > 1}
                href={href}
                framesOpen={framesOpen}
                onFail={() => fail(i)}
              />
              {n === visible.length - 1 && extra > 0 && (
                <span className="font-headline pointer-events-none absolute right-2 bottom-2 rounded-xs bg-background/85 px-1.5 pt-1 pb-0.5 text-lg leading-none text-foreground">
                  +{extra}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
      <span
        title={tagTitle}
        className={cn(
          "font-label pointer-events-none absolute top-2.5 left-2.5 inline-flex h-[22px] items-center rounded-xs bg-(--news-ink) px-2 text-[0.78rem] text-background",
          dashed && "outline-[1.5px] -outline-offset-[3px] outline-background/70 outline-dashed",
        )}
      >
        {tag}
      </span>
    </div>
  );
}
