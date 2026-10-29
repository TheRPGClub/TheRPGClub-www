import { cn } from "@/lib/utils";

// The winner starburst: the Monthly Issue's signature mark. It belongs to GOTM
// and NR-GOTM wins only, so it never decorates anything else. GOTM wears the
// highlighter yellow with ink type, NR-GOTM its own violet with white type.
//
// It is positioned by the caller (absolute inside a relative container) and
// stamps in once on mount; reduced motion skips the stamp.

const POINTS =
  "50,0 57,17 73,6 72,25 91,21 82,38 100,43 86,55 98,69 79,71 84,90 66,82 62,100 50,87 38,100 34,82 16,90 21,71 2,69 14,55 0,43 18,38 9,21 28,25 27,6 43,17";

const TRACK = {
  gotm: {
    fill: "fill-highlight",
    text: "text-ink",
    lines: ["Game", "of the", "Month"],
  },
  nr_gotm: {
    fill: "fill-nr",
    text: "text-white",
    lines: ["Non-RPG", "Game of", "the Month"],
  },
} as const;

export type StarburstTrack = keyof typeof TRACK;

export function Starburst({
  track,
  className,
  textClassName,
  rotate = -9,
}: {
  track: StarburstTrack;
  // Size and position, e.g. "absolute right-8 top-8 size-40".
  className?: string;
  // Font size for the lettering, scaled to the burst.
  textClassName?: string;
  // Degrees; a burst is never set square.
  rotate?: number;
}) {
  const style = TRACK[track];
  return (
    <div
      aria-hidden
      style={{ "--burst-rot": `${rotate}deg` } as React.CSSProperties}
      className={cn(
        "pointer-events-none grid [transform:rotate(var(--burst-rot))] place-items-center motion-safe:animate-[burst-stamp_480ms_cubic-bezier(0.16,1,0.3,1)_both]",
        className,
      )}
    >
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 size-full drop-shadow-[0_6px_14px_rgba(0,0,0,0.45)]"
      >
        <polygon points={POINTS} className={style.fill} />
      </svg>
      <span
        className={cn(
          "font-headline relative text-center leading-[0.92]",
          style.text,
          textClassName ?? "text-xl",
        )}
      >
        {style.lines.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </span>
    </div>
  );
}
