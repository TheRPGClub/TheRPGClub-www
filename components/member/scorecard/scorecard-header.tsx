"use client";

import {
  matchesTemplate,
  templateChoice,
  type ReviewFacets,
  type ReviewTemplateChoice,
} from "@/lib/reviews/facets";
import type { ReviewAccent } from "@/lib/reviews/accent";
import { ScorecardExplainer } from "./scorecard-explainer";
import { TemplatePicker } from "./template-picker";

// Two sides, one job each: what this section is on the left, what you can
// change on the right. The card already works this way lower down — the row
// controls and the weights footer both put their label left and their
// actions right — so the control belongs on the right rather than wedged
// between two pieces of static text.
export function ScorecardHeader({
  value,
  accent,
  disabled,
  onTemplate,
}: {
  value: ReviewFacets | null;
  accent: ReviewAccent;
  disabled?: boolean;
  onTemplate: (template: ReviewTemplateChoice) => void;
}) {
  const choice = templateChoice(value);
  // A template seeds a card and then gets out of the way — every row is
  // editable whichever preset it came from. `edited` only drives a marker.
  const edited = value !== null && !matchesTemplate(value);

  return (
    <header className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
      <div className="flex items-center gap-2.5">
        <h3 className="text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">
          Scorecard
        </h3>
        <ScorecardExplainer accent={accent} />
      </div>

      <div className="flex items-center gap-2">
        {/* The card has moved on from its preset. Not a problem — a
            template is a starting point — but worth saying, since the
            trigger alone would suggest it is still vanilla. */}
        {edited && choice !== "custom" && (
          <span className="text-xs text-muted-foreground/70">edited</span>
        )}
        <TemplatePicker choice={choice} disabled={disabled} onPick={onTemplate} />
      </div>
    </header>
  );
}
