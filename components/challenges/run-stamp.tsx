import type { CSSProperties } from "react";
import Link from "next/link";
import { FORMAT_NAME } from "@/lib/challenges/board";
import type { StampView } from "@/lib/challenges/profile-runs";
import { tintStyle } from "@/lib/challenges/tint";
import { cn } from "@/lib/utils";
import { FormatSquare } from "@/components/challenges/format-mark";
import { GameCover } from "@/components/issue/game-cover";

// A Run as a stamp (surface brief challenges-profile-runs, 7C): a perforated
// edge (ink holes on a 16px repeat) around an inner panel, resting at its
// stable tilt (halved on phones) with the object lift. The whole stamp links
// to the Challenge page.

const PERFORATION = {
  rule: "[background:radial-gradient(circle,var(--color-background)_5px,transparent_5.5px)_-8px_-8px/16px_16px,var(--color-border-strong)]",
  paper:
    "[background:radial-gradient(circle,var(--color-background)_5px,transparent_5.5px)_-8px_-8px/16px_16px,var(--color-foreground)]",
};

export function StampFrame({
  stamp,
  edge,
  className,
  children,
}: {
  stamp: StampView;
  edge: keyof typeof PERFORATION;
  className?: string;
  children: React.ReactNode;
}) {
  const style = { ...tintStyle(stamp.tint), "--tilt": `${stamp.tilt}deg`, "--tilt-sm": `${stamp.tilt / 2}deg` };
  return (
    <div
      data-slot="run-stamp"
      data-variant={edge}
      style={style as CSSProperties}
      className={cn(
        "relative p-2.5",
        PERFORATION[edge],
        className,
      )}
    >
      {children}
    </div>
  );
}

// The Challenge's name, stretched over the whole stamp as its link.
export function StampTitle({ stamp, className }: { stamp: StampView; className?: string }) {
  return (
    <h3 className={cn("font-headline text-balance break-words", className)}>
      <Link
        href={stamp.href}
        className="outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:outline-3 focus-visible:after:outline-offset-2 focus-visible:after:outline-highlight"
      >
        {stamp.name}
      </Link>
    </h3>
  );
}

// A current Run, large and landscape: an ink-2 panel edged in the tint's hi,
// the name in the hi, the score, a bar (not for Slots), the when-line, and
// the In Progress or assigned cover at the right. A Secret Santa sign-up
// waiting for its draw reads "Signed up" in place of the score.
export function CurrentStamp({ stamp }: { stamp: StampView }) {
  return (
    <StampFrame stamp={stamp} edge="rule" className="h-full">
      <div data-slot="current-stamp" className="grid h-full min-h-[220px] grid-cols-[minmax(0,1fr)_auto] gap-x-4 bg-card px-[18px] pt-4 pb-3.5 shadow-[inset_0_0_0_2px_var(--challenge-tint-hi)]">
        <div className="flex min-w-0 flex-col">
          <p className="font-label inline-flex items-center gap-[7px] text-[0.75rem] leading-none font-extrabold tracking-[0.1em]">
            <FormatSquare format={stamp.format} />
            {FORMAT_NAME[stamp.format]}
          </p>
          <StampTitle stamp={stamp} className="mt-2.5 text-[2.125rem] leading-[0.9] text-(--challenge-tint-hi)" />
          <div className="mt-auto flex items-end gap-3 pt-[18px]">
            {stamp.signedUp ? (
              <p className="font-headline text-[2.75rem] leading-[0.85]">Signed up</p>
            ) : (
              <p className="font-headline text-[4rem] leading-[0.8]">
                {stamp.cleared}
                <span className="text-[1.75rem] text-faint-foreground"> / {stamp.target}</span>
                <span className="sr-only"> Cleared</span>
              </p>
            )}
            {stamp.caughtUp && (
              <span data-slot="caught-up-stamp" className="font-headline mb-1 rounded-xs px-1.5 pt-1 pb-0.5 text-[0.95rem] leading-none text-(--challenge-tint-hi) shadow-[inset_0_0_0_2px_currentColor]">
                Caught Up
              </span>
            )}
          </div>
          {stamp.segments && (
            <div className="mt-2.5 flex gap-[3px]" aria-hidden>
              {stamp.segments.map((on, i) => (
                <i
                  key={i}
                  className={cn("h-[5px] flex-1 rounded-[1px]", on ? "bg-(--challenge-tint-hi)" : "bg-border-strong")}
                />
              ))}
            </div>
          )}
          <p className="mt-1.5 text-[0.85rem] text-dim-foreground">{stamp.whenLine}</p>
        </div>
        {stamp.cover && (
          <div className="flex flex-col items-center gap-1.5 pt-1">
            <GameCover
              title={stamp.cover.title}
              coverUrl={stamp.cover.coverUrl}
              alt={stamp.cover.title}
              className={cn(
                "w-[78px]",
                stamp.cover.label === "In Progress" && "outline-2 outline-offset-2 outline-foreground outline-dashed",
              )}
              fallbackClassName="text-[0.7rem] p-1"
            />
            <span className="font-label text-[0.7rem] leading-none font-extrabold tracking-[0.08em] text-dim-foreground">
              {stamp.cover.label}
            </span>
          </div>
        )}
      </div>
    </StampFrame>
  );
}
