import type { NewsFrame } from "@/lib/news";
import { cn } from "@/lib/utils";

// One frame of a card's art box (see NewsArt): the image, or "Image loading"
// for one the API marks unavailable; as a link to its own image (image-only
// News Items) or, out of the tab order, to the outside page.

const ART_IMG =
  "size-full object-cover motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-safe:group-hover/card:scale-[1.03]";

const FRAME_LINK =
  "block size-full overflow-hidden focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-highlight";

export function ArtFrame({
  frame,
  n,
  count,
  small,
  href,
  framesOpen,
  onFail,
}: {
  frame: NewsFrame;
  // Its place among the frames shown, and how many there are.
  n: number;
  count: number;
  small: boolean;
  href: string | null;
  framesOpen: boolean;
  onFail: () => void;
}) {
  const body = frame.unavailable || !frame.url ? (
    <ArtFallback text="Image loading" small={small} />
  ) : (
    <FrameImage url={frame.url} onFail={onFail} />
  );
  if (framesOpen && frame.url && !frame.unavailable) {
    return (
      <a
        href={frame.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={
          count > 1
            ? `Image ${n + 1} of ${count}, full size (opens in a new tab)`
            : "Image, full size (opens in a new tab)"
        }
        className={FRAME_LINK}
      >
        {body}
      </a>
    );
  }
  if (href && !framesOpen) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" tabIndex={-1} aria-hidden className={FRAME_LINK}>
        {body}
      </a>
    );
  }
  return body;
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

export function ArtFallback({ text, small = false }: { text: string; small?: boolean }) {
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
