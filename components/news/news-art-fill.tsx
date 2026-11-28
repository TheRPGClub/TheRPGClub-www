"use client";

import { useState, type CSSProperties } from "react";
import { workingFrame, type NewsFrame } from "@/lib/news";
import { cn } from "@/lib/utils";

// A hero's or tile's art, filling the box it sits in: the first frame that
// loads (the outside page's image, then the attachments), else an ink panel
// tinted in the News Category's ink with the site's initial set large in
// Anton. Outside images load from their own address with no referrer, never
// through the optimiser; one that fails moves on to the next frame, so a
// broken image never leaves a hole.

export function NewsArtFill({
  frames,
  ink,
  initial,
  big = false,
}: {
  frames: NewsFrame[];
  ink: string;
  initial: string;
  // The hero's panel sets its initial larger.
  big?: boolean;
}) {
  const [failed, setFailed] = useState<ReadonlySet<number>>(() => new Set());
  const frame = workingFrame(frames, failed);
  const fail = (i: number) => setFailed((prev) => (prev.has(i) ? prev : new Set(prev).add(i)));

  // The ink panel stays under the image, so art still loading (or lazy,
  // below the fold) shows the panel rather than a blank box.
  return (
    <>
      <InkPanel ink={ink} initial={initial} big={big} />
      {frame && (
        // eslint-disable-next-line @next/next/no-img-element -- outside-site and Discord images load from their own address, not through the optimiser (spec api#355)
        <img
          key={frame.i}
          src={frame.url}
          alt=""
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => fail(frame.i)}
          // An image that failed before hydration never fires onError:
          // check it once the element is attached.
          ref={(img) => {
            if (img && img.complete && img.naturalWidth === 0) fail(frame.i);
          }}
          className="absolute inset-0 size-full object-cover motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-safe:group-hover/tile:scale-[1.03]"
        />
      )}
    </>
  );
}

export function InkPanel({ ink, initial, big = false }: { ink: string; initial: string; big?: boolean }) {
  return (
    <div
      aria-hidden
      data-slot="news-ink-panel"
      style={{ "--news-ink": ink } as CSSProperties}
      className="absolute inset-0 overflow-hidden bg-[linear-gradient(160deg,color-mix(in_oklab,var(--news-ink)_30%,transparent),color-mix(in_oklab,var(--news-ink)_8%,transparent))]"
    >
      <span
        className={cn(
          "font-headline absolute top-0 right-3 leading-none text-(--news-ink) opacity-25 select-none",
          big ? "text-[16rem]" : "text-[6.5rem]",
        )}
      >
        {initial}
      </span>
    </div>
  );
}
