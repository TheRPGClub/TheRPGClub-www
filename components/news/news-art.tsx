"use client";

import { useState, type CSSProperties } from "react";
import type { NewsFrame } from "@/lib/news";
import { cn } from "@/lib/utils";

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

const MAX_FRAMES = 4;

const ART_IMG =
  "size-full object-cover motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-safe:group-hover/card:scale-[1.03]";

const FRAME_LINK =
  "block size-full overflow-hidden focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-highlight";

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

  const working = frames
    .map((frame, i) => ({ frame, i }))
    .filter(({ i }) => !failed.has(i));
  const shown = cover && working[0]?.i === 0 ? working.slice(0, 1) : working;
  const visible = shown.slice(0, MAX_FRAMES);
  const extra = shown.length - visible.length;

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
          {visible.map(({ frame, i }, n) => {
            const last = n === visible.length - 1;
            const body = frame.unavailable || !frame.url ? (
              <ArtFallback text="Image loading" small={visible.length > 1} />
            ) : (
              <FrameImage url={frame.url} onFail={() => fail(i)} />
            );
            return (
              <div
                key={i}
                className={cn(
                  "relative min-h-0 overflow-hidden",
                  visible.length === 3 && n === 0 && "row-span-2",
                )}
              >
                {framesOpen && frame.url && !frame.unavailable ? (
                  <a
                    href={frame.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={
                      shown.length > 1
                        ? `Image ${n + 1} of ${shown.length}, full size (opens in a new tab)`
                        : "Image, full size (opens in a new tab)"
                    }
                    className={FRAME_LINK}
                  >
                    {body}
                  </a>
                ) : href && !framesOpen ? (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    tabIndex={-1}
                    aria-hidden
                    className={FRAME_LINK}
                  >
                    {body}
                  </a>
                ) : (
                  body
                )}
                {last && extra > 0 && (
                  <span className="font-headline pointer-events-none absolute right-2 bottom-2 rounded-xs bg-background/85 px-1.5 pt-1 pb-0.5 text-lg leading-none text-foreground">
                    +{extra}
                  </span>
                )}
              </div>
            );
          })}
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

function FrameImage({ url, onFail }: { url: string; onFail: () => void }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- outside-site and Discord images load from their own address, not through the optimiser (spec api#355)
    <img
      src={url}
      alt=""
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={onFail}
      // An image that failed before hydration never fires onError: check it
      // once the element is attached.
      ref={(img) => {
        if (img && img.complete && img.naturalWidth === 0) onFail();
      }}
      className={ART_IMG}
    />
  );
}

function ArtFallback({ text, small = false }: { text: string; small?: boolean }) {
  return (
    <div
      className={cn(
        "flex size-full items-center justify-center bg-muted text-center",
        // Clear of the corner tag.
        small ? "px-2 pt-8 pb-2" : "px-6 pt-9 pb-4",
      )}
    >
      <span
        className={cn(
          "font-headline line-clamp-3 leading-none text-faint-foreground [overflow-wrap:anywhere]",
          small ? "text-base" : "text-[1.45rem]",
        )}
      >
        {text}
      </span>
    </div>
  );
}
