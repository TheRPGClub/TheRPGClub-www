import Link from "next/link";
import { slotSquares, yourRunLine, type FlyerExtras } from "@/lib/challenges/board";
import { runSegments } from "@/lib/challenges/runs";
import type { Challenge, ChallengeRun } from "@/lib/challenges/types";
import { cn } from "@/lib/utils";
import { CoverFan, NameTag, SlotRow } from "@/components/challenges/format-picture";

// The parts a flyer and a billboard share.

// The Challenge's name, linking to its page; its ::after stretches over the
// whole card so the card is the link, leaving room for actions laid above it.
export function FlyerTitle({ challenge, className }: { challenge: Challenge; className?: string }) {
  return (
    <h3 className={cn("font-headline text-balance break-words", className)}>
      <Link
        href={`/challenges/${challenge.id}`}
        className="outline-none after:absolute after:inset-0 after:rounded-md after:content-[''] focus-visible:after:outline-3 focus-visible:after:outline-offset-3 focus-visible:after:outline-highlight"
      >
        {challenge.name}
      </Link>
    </h3>
  );
}

export function FormatPicture({
  challenge,
  extras,
  run,
  today,
  size = "sm",
}: {
  challenge: Challenge;
  extras: FlyerExtras | undefined;
  run: ChallengeRun | undefined;
  today: string;
  size?: "sm" | "lg";
}) {
  if (challenge.challenge_format === "slots")
    return <SlotRow squares={slotSquares(challenge, run, today)} size={size} />;
  if (challenge.challenge_format === "assignment") return <NameTag size={size} />;
  return <CoverFan games={extras?.covers ?? []} size={size} muted={!challenge.open} />;
}

// The paper tape across a flyer's top edge: when it opens, or "Hidden" for
// staff and its Host.
export function Tape({ children }: { children: React.ReactNode }) {
  return (
    <span
      data-slot="flyer-tape"
      className="font-label absolute -top-3 left-1/2 z-10 -translate-x-1/2 bg-foreground px-3.5 pt-1.5 pb-[5px] text-[0.84rem] leading-none font-extrabold tracking-[0.08em] whitespace-nowrap text-background">
      {children}
    </span>
  );
}

// The viewer's Run as an ink chip, with a Pool Run's bar on a billboard.
export function YourRunChip({ run, bar = false }: { run: ChallengeRun; bar?: boolean }) {
  const segments = bar ? runSegments(run.progress.cleared, run.progress.target) : [];
  return (
    <p
      data-slot="your-run-chip"
      className="font-label relative inline-flex items-center gap-2 rounded-sm bg-background px-2.5 py-2.5 text-[0.84rem] leading-none font-extrabold tracking-[0.08em] text-foreground">
      {yourRunLine(run)}
      {segments.length > 0 && (
        <span className="inline-flex gap-[3px]" aria-hidden>
          {segments.map((on, i) => (
            <i
              key={i}
              className={cn("h-1.5 w-4 rounded-[1px]", on ? "bg-(--challenge-tint-hi)" : "bg-border-strong")}
            />
          ))}
        </span>
      )}
    </p>
  );
}

// A count in the footer: an Anton numeral over nothing, its word beside it.
export function Count({ value, label, className }: { value: number | null; label: string; className?: string }) {
  if (value == null) return null;
  return (
    <span className={cn("inline-flex items-baseline gap-1.5", className)}>
      <b className="font-headline text-[1.4rem] leading-none font-normal">{value}</b>
      <span>{label}</span>
    </span>
  );
}
