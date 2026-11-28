import { cn } from "@/lib/utils";

// The winner mark: the Monthly Issue's starburst, Aero's glossy bubble. It
// belongs to GOTM and NR-GOTM wins and the GOTY Vote's Awards only, so it
// never decorates anything else. Each track wears its own ink: GOTM the
// highlight, NR-GOTM its own colour, Game of the Year the page's ink.
//
// It is positioned by the caller (absolute inside a relative container) and
// lands once on mount; reduced motion skips that. Each Theme draws it
// (themes/<name>/areas/issue.css) by its slot: the track as data-track, the
// lean the caller asks for as data-lean (a Theme may set it square), and
// data-still for a burst that skips its landing.

export const BURST_POINTS =
  "50,0 57,17 73,6 72,25 91,21 82,38 100,43 86,55 98,69 79,71 84,90 66,82 62,100 50,87 38,100 34,82 16,90 21,71 2,69 14,55 0,43 18,38 9,21 28,25 27,6 43,17";

const TRACK = {
  gotm: {
    fill: "fill-highlight",
    text: "text-highlight-foreground",
    lines: ["Game", "of the", "Month"],
  },
  nr_gotm: {
    fill: "fill-nr",
    text: "text-nr-foreground",
    lines: ["Non-RPG", "Game of", "the Month"],
  },
  goty: {
    fill: "fill-foreground",
    text: "text-background",
    lines: ["Game", "of the", "Year"],
  },
} as const;

export type StarburstTrack = keyof typeof TRACK;

// The leans a caller may ask for, in degrees; a Theme decides what each
// looks like (the Monthly Issue never sets a burst square).
export type StarburstLean = -10 | -9 | -7 | 8;

export function Starburst({
  track,
  className,
  textClassName,
  rotate = -9,
  lines,
  still = false,
  scale,
}: {
  track: StarburstTrack;
  // Size and position, e.g. "absolute right-8 top-8 size-40".
  className?: string;
  // Font size for the lettering, scaled to the burst.
  textClassName?: string;
  // The lean, in degrees.
  rotate?: StarburstLean;
  // Overrides the track's lettering, e.g. ["GOTM"] at badge scale.
  lines?: readonly string[];
  // Skips the landing: for bursts repeated across a grid, where the page's
  // one authored moment lives elsewhere.
  still?: boolean;
  // "badge": the small mark on a cover's corner.
  scale?: "badge";
}) {
  const style = TRACK[track];
  const lettering = lines ?? style.lines;
  return (
    <div
      aria-hidden
      data-slot="starburst"
      data-track={track}
      data-lean={rotate}
      data-still={still || undefined}
      data-scale={scale}
      className={cn("pointer-events-none grid place-items-center", className)}
    >
      <svg data-slot="starburst-shape" viewBox="0 0 100 100" className="absolute inset-0 size-full">
        <polygon points={BURST_POINTS} className={style.fill} />
      </svg>
      <span
        data-slot="starburst-text"
        className={cn(
          "font-headline relative text-center leading-[0.92]",
          style.text,
          textClassName ?? "text-xl",
        )}
      >
        {lettering.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </span>
    </div>
  );
}
