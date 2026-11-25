"use client";

import { facetDef, type FacetKey, type ReviewFacets } from "@/lib/reviews/facets";
import { withLabel, withOrder, withScore, withWeight } from "@/lib/reviews/scorecard-edits";
import type { ReviewAccent } from "@/lib/reviews/accent";
import { cn } from "@/lib/utils";
import { useSortable } from "@/hooks/use-sortable";
import { SortGrip } from "@/components/sortable/sort-grip";
import { SortStatus } from "@/components/sortable/sort-status";
import { FacetRow } from "./facet-row";

// The card's rows, in order; drag a row to move it. The parent remounts this
// list (by key) to deal a new template's rows in.
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
  const labelOf = (key: FacetKey) => value.labels?.[key] ?? facetDef(key)?.label ?? "";
  const s = useSortable({
    zones: { facets: value.order },
    layout: "rows",
    disabled,
    name: (key) => labelOf(key) || "This category",
    onDrop: (next) => onChange(withOrder(value, next.facets)),
  });

  return (
    <div {...s.zone("facets")}>
      {s.zones.facets.map((key, index) => (
        // The wrapper carries the entrance so `FacetRow` stays a control and
        // knows nothing about how it arrived. `backwards` fill keeps a delayed
        // row hidden until its turn instead of flashing at full opacity
        // first, and the stagger is capped so a twelve-row card does not turn
        // the rebuild into a wait. The sortable item is the box inside it, so
        // the drag's own motion never cancels the entrance.
        <div
          key={key}
          className={cn(
            "animate-in fade-in slide-in-from-top-1 duration-200 ease-out",
            "[animation-fill-mode:backwards] motion-reduce:animate-none",
          )}
          style={{ animationDelay: `${Math.min(index, 8) * 25}ms` }}
        >
          <div {...s.item(key)} className="flex items-center gap-1.5 border-t border-border-strong">
            {!disabled && <SortGrip />}
            <FacetRow
              facetKey={key}
              score={value.scores[key]}
              weight={value.weights?.[key]}
              accent={accent}
              disabled={disabled}
              onScore={(score) => onChange(withScore(value, key, score))}
              onWeight={(weight) => onChange(withWeight(value, key, weight))}
              label={labelOf(key)}
              autoEdit={key === addedKey}
              onLabel={(label) => onChange(withLabel(value, key, label))}
              controls={{
                onRemove: () => onChange(withOrder(value, value.order.filter((other) => other !== key))),
              }}
            />
          </div>
        </div>
      ))}
      {!disabled && <SortStatus status={s.status} />}
    </div>
  );
}
