"use client";

import { facetDef, type FacetKey, type ReviewFacets } from "@/lib/reviews/facets";
import {
  moveFacet,
  withLabel,
  withOrder,
  withScore,
  withWeight,
} from "@/lib/reviews/scorecard-edits";
import type { ReviewAccent } from "@/lib/reviews/accent";
import { cn } from "@/lib/utils";
import { FacetRow } from "./facet-row";

// The card's rows, in order. The parent remounts this list (by key) to deal a
// new template's rows in.
export function FacetList({
  value,
  onChange,
  addedKey,
  accent,
  disabled,
}: {
  value: ReviewFacets;
  onChange: (next: ReviewFacets) => void;
  addedKey: FacetKey | null;
  accent: ReviewAccent;
  disabled?: boolean;
}) {
  const last = value.order.length - 1;

  return (
    <div className="space-y-1.5">
      {value.order.map((key, index) => (
        // The wrapper carries the entrance so `FacetRow` stays a control and
        // knows nothing about how it arrived. `backwards` fill keeps a delayed
        // row hidden until its turn instead of flashing at full opacity
        // first, and the stagger is capped so a twelve-row card does not turn
        // the rebuild into a wait.
        <div
          key={key}
          className={cn(
            "animate-in fade-in slide-in-from-top-1 duration-200 ease-out",
            "[animation-fill-mode:backwards] motion-reduce:animate-none",
          )}
          style={{ animationDelay: `${Math.min(index, 8) * 25}ms` }}
        >
          <FacetRow
            facetKey={key}
            score={value.scores[key]}
            weight={value.weights?.[key]}
            accent={accent}
            disabled={disabled}
            onScore={(score) => onChange(withScore(value, key, score))}
            onWeight={(weight) => onChange(withWeight(value, key, weight))}
            label={value.labels?.[key] ?? facetDef(key)?.label ?? ""}
            autoEdit={key === addedKey}
            onLabel={(label) => onChange(withLabel(value, key, label))}
            controls={{
              onUp: index > 0 ? () => onChange(moveFacet(value, index, -1)) : undefined,
              onDown: index < last ? () => onChange(moveFacet(value, index, 1)) : undefined,
              onRemove: () =>
                onChange(withOrder(value, value.order.filter((other) => other !== key))),
            }}
          />
        </div>
      ))}
    </div>
  );
}
