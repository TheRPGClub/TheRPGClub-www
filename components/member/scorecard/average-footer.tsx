"use client";

import { Button } from "@/components/ui/button";
import { reviewAccents, type ReviewAccent } from "@/lib/reviews/accent";
import { cn } from "@/lib/utils";

// What the rows average, and the offer to use it as the overall score.
export function AverageFooter({
  average,
  overall,
  accent,
  disabled,
  onUseAverage,
}: {
  average: number;
  overall: number | null;
  accent: ReviewAccent;
  disabled?: boolean;
  onUseAverage: (average: number) => void;
}) {
  const style = reviewAccents[accent];

  return (
    <footer className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-border/60 pt-2.5 text-xs">
      <p className="text-muted-foreground">
        These average{" "}
        <span className={cn("font-semibold tabular-nums", style.readout)}>{average}</span>
      </p>
      {/* A suggestion, never a rule. The overall is the reviewer's verdict,
          and the gap between it and the arithmetic is usually the most
          interesting thing on the page. */}
      {overall === average ? (
        <span className="text-muted-foreground">Matches your overall</span>
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
