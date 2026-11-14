"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { MAX_FACETS, type ReviewFacets } from "@/lib/reviews/facets";
import { unpickedFacets, withOrder } from "@/lib/reviews/scorecard-edits";

// The catalogue categories not on the card yet, one button each, then the
// way to name your own.
export function FacetPicker({
  value,
  onChange,
  onAddOwn,
  disabled,
}: {
  value: ReviewFacets;
  onChange: (next: ReviewFacets) => void;
  onAddOwn: () => void;
  disabled?: boolean;
}) {
  const full = value.order.length >= MAX_FACETS;

  return (
    <div className="flex flex-wrap items-center gap-1">
      {unpickedFacets(value).map((facet) => (
        <Tooltip key={facet.key}>
          <TooltipTrigger
            render={
              <Button
                type="button"
                variant="outline"
                size="xs"
                disabled={disabled || full}
                onClick={() => onChange(withOrder(value, [...value.order, facet.key]))}
              />
            }
          >
            <Plus />
            {facet.label}
          </TooltipTrigger>
          <TooltipContent>{facet.hint}</TooltipContent>
        </Tooltip>
      ))}

      {/* Nothing in the catalogue fits? Name your own. It lives on this
          review only — the club can average `music` across everyone's
          reviews, but not a field one person invented — so renaming a
          catalogue row is the better move where one is close enough. */}
      <Button
        type="button"
        variant="subtle"
        size="xs"
        disabled={disabled || full}
        onClick={onAddOwn}
      >
        <Plus />
        Add your own
      </Button>

      {full && (
        <span className="text-xs text-muted-foreground">
          {MAX_FACETS} categories is the limit.
        </span>
      )}
    </div>
  );
}
