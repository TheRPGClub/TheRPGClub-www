"use client";

import { useState } from "react";

import {
  applyTemplate,
  facetAverage,
  type FacetKey,
  type ReviewFacets,
} from "@/lib/reviews/facets";
import { withCustomFacet } from "@/lib/reviews/scorecard-edits";
import type { ReviewAccent } from "@/lib/reviews/accent";
import { ScorecardHeader } from "./scorecard/scorecard-header";
import { FacetList } from "./scorecard/facet-list";
import { FacetPicker } from "./scorecard/facet-picker";
import { WeightsFooter } from "./scorecard/weights-footer";
import { AverageFooter } from "./scorecard/average-footer";

export interface ReviewScorecardEditorProps {
  // null is a quick take — no scorecard — which is a real choice and not an
  // absence of one.
  value: ReviewFacets | null;
  onChange: (next: ReviewFacets | null) => void;
  // The review's overall score, so the footer can say whether the parts agree
  // with the whole. null while it is still unset.
  overall: number | null;
  onUseAverage: (average: number) => void;
  accent?: ReviewAccent;
  disabled?: boolean;
}

/**
 * The per-category scorecard, as it is filled in.
 *
 * Deliberately quieter than the overall rating above it: the same accent ramp,
 * but thin tracks and small type, so the composer still has one loud number on
 * it. The scorecard breaks that number down, it doesn't compete with it.
 */
export function ReviewScorecardEditor({
  value,
  onChange,
  overall,
  onUseAverage,
  accent = "neutral",
  disabled,
}: ReviewScorecardEditorProps) {
  // Applying a template rewrites most of the card at once — rows appear,
  // vanish and change places in the same frame, which reads as a flicker. This
  // counter remounts the list so the new set can be dealt in. Bumped only for
  // a template, never for a rename, reorder or single add: those are one small
  // change the eye can already follow, and replaying the whole list for them
  // would be motion for its own sake.
  const [rebuild, setRebuild] = useState(0);
  // The row the reviewer just invented, so it can open in its rename field.
  // Never cleared, and it does not need to be: it is only read as a row's
  // initial mount state, and `nextCustomKey` never reuses a number, so a key
  // that has already been through here cannot mount a second time.
  const [addedKey, setAddedKey] = useState<FacetKey | null>(null);
  const average = facetAverage(value);

  return (
    <section className="space-y-3 rounded-lg border border-border/60 bg-background/40 p-3">
      <ScorecardHeader
        value={value}
        accent={accent}
        disabled={disabled}
        onTemplate={(template) => {
          // A row queued to open its rename field belongs to the card being
          // replaced; carrying it across would reopen a name on the rebuilt
          // one.
          setAddedKey(null);
          setRebuild((n) => n + 1);
          onChange(applyTemplate(value, template));
        }}
      />

      {value && value.order.length > 0 && (
        <FacetList
          key={rebuild}
          value={value}
          onChange={onChange}
          addedKey={addedKey}
          accent={accent}
          disabled={disabled}
        />
      )}

      {value && (
        <FacetPicker
          value={value}
          onChange={onChange}
          disabled={disabled}
          onAddOwn={() => {
            const added = withCustomFacet(value);
            setAddedKey(added.key);
            onChange(added.card);
          }}
        />
      )}

      {value?.order.length === 0 && (
        <p className="text-xs text-muted-foreground">
          Pick the categories you want to grade this one on.
        </p>
      )}

      {value && value.order.length > 0 && (
        <WeightsFooter value={value} onChange={onChange} disabled={disabled} />
      )}

      {average !== null && (
        <AverageFooter
          average={average}
          overall={overall}
          accent={accent}
          disabled={disabled}
          onUseAverage={onUseAverage}
        />
      )}
    </section>
  );
}
