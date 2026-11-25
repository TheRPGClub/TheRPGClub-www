import Link from "next/link";
import { Starburst } from "@/components/issue/starburst";
import type { Rosette, RosetteBurst } from "@/lib/games/goty-rosettes";
import { cn } from "@/lib/utils";

// The game hero's rosettes (design www#191, option B): each GOTY Vote Award
// hangs ribbon tails off a starburst, the track's own burst for its track's
// Award and a paper burst for Game of the Year. Rosettes overlap at the
// hero's top right; each one links to /goty. Laid out at desktop size and
// scaled down on smaller screens, as one piece.

const INK: Record<RosetteBurst, { fill: string; band: string; letters: string }> = {
  gotm: { fill: "fill-gotm", band: "bg-gotm text-gotm-foreground", letters: "text-[1.45rem]" },
  nr_gotm: { fill: "fill-nr", band: "bg-nr text-nr-foreground", letters: "text-[1.2rem]" },
  goty: { fill: "fill-foreground", band: "bg-foreground text-background", letters: "text-[1.6rem]" },
};

function Tails({ burst, tail, year }: { burst: RosetteBurst; tail: string; year: number }) {
  const ink = INK[burst];
  return (
    <span aria-hidden className="absolute top-[118px] left-7 block size-30">
      <svg
        viewBox="0 0 120 92"
        className="absolute top-[22px] left-0 h-[92px] w-30 drop-shadow-[0_6px_10px_rgba(0,0,0,0.4)]"
      >
        <polygon points="22,0 56,0 50,92 38,78 26,92" className={ink.fill} transform="rotate(14 40 0)" />
        <polygon points="64,0 98,0 94,92 82,78 70,92" className={ink.fill} transform="rotate(-14 80 0)" />
      </svg>
      <span
        className={cn(
          "font-label absolute top-0 left-1/2 z-[2] flex h-[34px] -translate-x-1/2 -rotate-4 items-center gap-1.5 whitespace-nowrap px-2.5 text-[0.72rem] font-extrabold tracking-[0.05em] uppercase shadow-[0_6px_12px_rgb(0_0_0/0.35)]",
          ink.band,
          !tail && "px-5",
        )}
      >
        {tail}
        <b className="font-headline text-[1.3rem] font-normal tracking-normal">{year}</b>
      </span>
    </span>
  );
}

export function GotyRosettes({ rosettes, className }: { rosettes: readonly Rosette[]; className?: string }) {
  return (
    <div
      className={cn(
        "absolute top-12 right-3 z-10 flex origin-top-right scale-[0.62] items-start md:top-16 md:right-10 md:scale-[0.8] lg:scale-100",
        className,
      )}
    >
      {rosettes.map((rosette, i) => {
        const burst = (
          <Starburst
            track={rosette.burst}
            rotate={rosette.burst === "goty" ? -7 : 8}
            still={i > 0}
            className="absolute top-0 left-0 size-44"
            textClassName={INK[rosette.burst].letters}
          />
        );
        const place = cn("relative block h-60 w-44 flex-none", i > 0 && "mt-[22px] -ml-9");
        if (!rosette.award) {
          return (
            <span key={rosette.burst} className={place}>
              {burst}
            </span>
          );
        }
        return (
          <Link
            key={`${rosette.burst}-${rosette.award.year}`}
            href="/goty"
            aria-label={`${rosette.award.name} ${rosette.award.year}, see the GOTY Vote`}
            className={cn(
              place,
              "transition-[filter] duration-150 hover:brightness-[1.06] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight",
            )}
          >
            <Tails burst={rosette.burst} tail={rosette.award.tail} year={rosette.award.year} />
            {burst}
          </Link>
        );
      })}
    </div>
  );
}
