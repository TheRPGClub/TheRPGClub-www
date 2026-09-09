import Link from "next/link";
import { cn } from "@/lib/utils";

export type VotingPhase = "vote" | "nominate";

// Each phase owns a hue: voting is the club's brand red, nominating the
// purple. Text sits a step apart from the bar (300 vs 400) because the two
// palettes diverge in lightness there — brand-300 is oklch L 0.675 and
// purple-400 L 0.714, so they carry equal weight; purple-300 (L 0.827) would
// read much brighter than its red counterpart.
const accentClasses = {
  brand: { text: "text-brand-300", bar: "bg-brand-500" },
  purple: { text: "text-purple-400", bar: "bg-purple-500" },
} as const;

export type PhaseAccent = keyof typeof accentClasses;

export interface PhaseSegment {
  phase: VotingPhase;
  label: string;
  // Plain-language window state, including which round it applies to —
  // voting targets the current round, nominations the next one.
  detail: string;
  accent: PhaseAccent;
}

export interface PhaseSwitcherProps {
  // Order carries priority: the caller puts the phase that's live first.
  segments: PhaseSegment[];
  active: VotingPhase;
}

export function PhaseSwitcher({ segments, active }: PhaseSwitcherProps) {
  return (
    <nav aria-label="Voting phase" className="flex border-b">
      {segments.map((segment) => {
        const selected = segment.phase === active;
        const accent = accentClasses[segment.accent];

        return (
          <Link
            key={segment.phase}
            href={`/voting?phase=${segment.phase}`}
            aria-current={selected ? "page" : undefined}
            className={cn(
              // min-w-0 lets a tab shrink below its text width and max-w
              // caps it instead of a hard min-width: at md the sidebar takes
              // 256px, leaving less room than two 256px tabs would demand.
              "group relative min-w-0 flex-1 px-4 py-3 sm:max-w-64",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden",
            )}
          >
            <span
              className={cn(
                "block text-sm font-semibold transition-colors",
                selected
                  ? accent.text
                  : // Faded from the bright foreground rather than the muted
                    // token, which keeps it legible (5.2:1) while still
                    // clearly receding behind the selected tab's hue.
                    "text-foreground/50 group-hover:text-foreground/80",
              )}
            >
              {segment.label}
            </span>
            {/* The window state stays readable on both tabs: comparing the two
                windows is the switcher's whole job, so it isn't faded. */}
            <span className="mt-0.5 block text-xs text-muted-foreground">
              {segment.detail}
            </span>
            {selected && (
              // Sits on the container's border, so it reads as the live edge.
              // The cut corner echoes the club logo's torn-paper shapes.
              <span
                aria-hidden
                className={cn(
                  "absolute inset-x-0 -bottom-px h-[3px] [clip-path:polygon(0_0,100%_0,calc(100%-20px)_100%,0_100%)]",
                  accent.bar,
                )}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
