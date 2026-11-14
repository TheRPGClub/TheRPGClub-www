import { SlideFrame, headlineSize } from "@/components/join/slide-frame";
import { cn } from "@/lib/utils";

// A /join slide for something Members do on the site: type on the ink
// ground, with recent winners' real covers dealt beneath it as its art,
// seated on the slide's foot so the fan swaps in place between slides. It
// shows no member data and no counts.

export interface DealtCover {
  key: string;
  url: string;
}

// Covers rest at a hand-placed tilt, never square.
const TILTS = ["-rotate-2", "rotate-[1.5deg]", "-rotate-1", "rotate-2"];

export function FeatureSlide({
  lines,
  body,
  covers,
}: {
  // The headline's two lines; the first may be empty.
  lines: [string, string];
  body: string;
  covers: DealtCover[];
}) {
  return (
    <SlideFrame>
      <h2 className={cn("font-headline mt-2 leading-[0.9] sm:mt-6", headlineSize(lines))}>
        {lines[0] && <span className="block">{lines[0]}</span>}
        <span className="block">{lines[1]}</span>
      </h2>
      <p className="mt-4 max-w-[46ch] text-dim-foreground sm:mt-5 sm:text-[1.06rem]">{body}</p>
      {covers.length > 0 && (
        <ul aria-hidden className="mt-auto flex pt-7 pl-1 sm:pt-9 [@media(max-height:42rem)]:max-lg:hidden">
          {covers.map((cover, index) => (
            <li
              key={cover.key}
              className={cn(
                "-ml-2 aspect-[3/4] w-[4.5rem] overflow-hidden rounded-sm shadow-[0_12px_30px_rgb(0_0_0/0.5)] ring-1 ring-foreground/12 ring-inset first:ml-0 sm:-ml-3 sm:w-24 lg:w-[clamp(7.5rem,9vw,9.5rem)]",
                TILTS[index % TILTS.length],
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cover.url} alt="" className="size-full object-cover" />
            </li>
          ))}
        </ul>
      )}
    </SlideFrame>
  );
}
