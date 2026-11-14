"use client";

import { Button } from "@/components/ui/button";
import {
  WEIGHT_TOTAL,
  evenWeights,
  rebalanceWeights,
  weightsError,
  type ReviewFacets,
} from "@/lib/reviews/facets";
import { canEvenSplit } from "@/lib/reviews/scorecard-edits";

// Whether the shares add up, and the two ways to make them.
export function WeightsFooter({
  value,
  onChange,
  disabled,
}: {
  value: ReviewFacets;
  onChange: (next: ReviewFacets) => void;
  disabled?: boolean;
}) {
  const budgetError = weightsError(value);

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-border/60 pt-2.5 text-xs">
      {budgetError ? (
        // Named rather than silently corrected: rewriting a number someone
        // just typed is worse than telling them it doesn't add up yet.
        <p role="alert" className="text-destructive">
          {budgetError}
        </p>
      ) : (
        <p className="text-muted-foreground">
          Weights use all{" "}
          <span className="font-semibold tabular-nums">{WEIGHT_TOTAL}%</span>
        </p>
      )}
      <div className="flex items-center gap-1">
        {budgetError && (
          <Button
            type="button"
            variant="outline"
            size="xs"
            disabled={disabled}
            onClick={() =>
              onChange({
                ...value,
                weights: rebalanceWeights(value.order, value.weights ?? {}),
              })
            }
          >
            Scale to {WEIGHT_TOTAL}%
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          size="xs"
          disabled={disabled || !canEvenSplit(value)}
          onClick={() => onChange({ ...value, weights: evenWeights(value.order) })}
        >
          Even split
        </Button>
      </div>
    </div>
  );
}
