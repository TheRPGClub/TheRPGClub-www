"use client";

import { Button } from "@/components/ui/button";
import type { ReviewAccent } from "@/lib/reviews/accent";

// What the rows average, and the offer to use it as the overall score.
export function AverageFooter({
  average,
  overall,
  disabled,
  onUseAverage,
}: {
  average: number;
  overall: number | null;
  // Kept for callers; the average reads in paper on every track.
  accent?: ReviewAccent;
  disabled?: boolean;
  onUseAverage: (average: number) => void;
}) {
  return (
    <footer className="font-label flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-border-strong pt-2.5 text-[0.74rem] font-bold tracking-[0.08em]">
      <p className="flex items-baseline gap-1.5 text-faint-foreground">
        These average{" "}
        <span className="font-headline text-[1.45rem] leading-none tracking-normal text-foreground tabular-nums">{average}</span>
      </p>
      {/* A suggestion, never a rule. The overall is the reviewer's verdict,
          and the gap between it and the arithmetic is usually the most
          interesting thing on the page. */}
      {overall === average ? (
        <span className="text-faint-foreground">Matches your overall</span>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="xs"
          disabled={disabled}
          onClick={() => onUseAverage(average)}
        >
          Use as overall
        </Button>
      )}
    </footer>
  );
}
