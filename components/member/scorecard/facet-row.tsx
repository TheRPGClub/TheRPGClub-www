"use client";

import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { MAX_RATING, MIN_RATING, clampRating, parseRatingInput } from "@/lib/api/rating";
import { WEIGHT_TOTAL, facetDef, type FacetKey } from "@/lib/reviews/facets";
import { reviewAccents, type ReviewAccent } from "@/lib/reviews/accent";
import { cn } from "@/lib/utils";
import { FacetName } from "./facet-name";
import { FacetRowControls, type FacetRowControlsProps } from "./facet-row-controls";

// The weight's readout: a small number set into the row, three characters
// wide, right-aligned so the digits line up down the card.
const READOUT = "h-auto w-[3ch] border-0 p-0 text-right text-xs tabular-nums transition-none md:text-xs";

export function FacetRow({
  facetKey,
  label,
  autoEdit,
  score,
  weight,
  accent,
  disabled,
  onLabel,
  onScore,
  onWeight,
  controls,
}: {
  facetKey: FacetKey;
  // What the row is called right now — the reviewer's own name for it, or
  // the catalogue's where they haven't given one.
  label: string;
  // Open straight into the rename field. Set for a row the reviewer has just
  // added, which has a placeholder rather than a name.
  autoEdit?: boolean;
  score: number | undefined;
  // Always set in practice — every card the composer holds carries a split —
  // but optional so a row can still render if one is somehow missing.
  weight: number | undefined;
  accent: ReviewAccent;
  disabled?: boolean;
  onLabel: (label: string) => void;
  onScore: (score: number | null) => void;
  onWeight: (weight: number) => void;
  controls?: Omit<FacetRowControlsProps, "named" | "disabled">;
}) {
  const style = reviewAccents[accent];
  const unset = score === undefined;
  // Falls back to the key only if a custom row somehow lost its name; the
  // sanitizer drops those, so this is belt and braces for the live editor,
  // where a name can be empty mid-edit.
  const named = label || facetDef(facetKey)?.label || "This category";

  // One line per category, so a full card of twelve stays short beside the
  // sheet: the name with its share under it, a small ruler, the score in
  // Anton. The remove tool sits beside the share and shows on hover or
  // focus (always, on a screen with no hover). The row itself drags to
  // reorder (FacetList); the ruler is a control, so it never starts a drag.
  return (
    <div className="group/facet relative grid min-w-0 flex-1 grid-cols-[7rem_minmax(0,1fr)_2.4rem] items-center gap-x-2.5 py-1.5">
      <div className="min-w-0">
        <FacetName
          facetKey={facetKey}
          label={label}
          named={named}
          autoEdit={autoEdit}
          disabled={disabled}
          onLabel={onLabel}
        />
        <div className="flex items-center gap-1">
          {weight !== undefined && (
            <span className="font-label flex shrink-0 items-baseline text-[0.72rem] font-bold text-faint-foreground">
              <Input
                variant="readout"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                maxLength={3}
                disabled={disabled}
                aria-label={`${named}, share of the ${WEIGHT_TOTAL}% weighting`}
                value={weight}
                onChange={(e) => {
                  // Shares the score field's parser: it already filters to
                  // digits and clamps to 0..100, which is exactly the
                  // budget's range. Emptying the field reads as 0%, not as
                  // "no weight": every row has a share, and a share of
                  // nothing is a real answer.
                  const next = parseRatingInput(e.target.value);
                  if (next !== undefined) onWeight(next ?? 0);
                }}
                className={READOUT}
              />
              <span aria-hidden>%</span>
            </span>
          )}
          {controls && <FacetRowControls {...controls} named={named} disabled={disabled} />}
        </div>
      </div>

      {/* A pointer on the ruler sets a score; it must not lift the row. */}
      <div data-no-drag="" className="min-w-0">
        <Slider
          className="min-w-0"
          // An unscored facet rests at the floor with the readout showing "—",
          // so it never passes for a deliberate 0 — which is a real score here.
          value={score ?? MIN_RATING}
          onValueChange={(next) => onScore(clampRating(typeof next === "number" ? next : next[0]))}
          min={MIN_RATING}
          max={MAX_RATING}
          step={1}
          disabled={disabled}
          getAriaLabel={() => `${named}, out of ${MAX_RATING}`}
          getAriaValueText={() => (unset ? "Not scored" : `${score} out of ${MAX_RATING}`)}
          tone={style.sliderTone}
          variant="ruler"
          size="sm"
          indicatorClassName={cn(unset && "opacity-0")}
        />
      </div>

      {/* The score's ink, carried by a box that draws nothing. */}
      <span className={cn("contents", unset ? "text-faint-foreground" : "text-foreground")}>
        <Input
          // Same contract as the overall's readout: a text field so it
          // carries no spinner arrows, with `parseRatingInput` owning the
          // filtering.
          variant="readout"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          maxLength={3}
          disabled={disabled}
          placeholder="—"
          aria-label={`${named}, out of ${MAX_RATING}`}
          value={score ?? ""}
          onChange={(e) => {
            const next = parseRatingInput(e.target.value);
            // undefined means the keystroke wasn't a digit — ignore it rather
            // than letting it clear a score already given.
            if (next !== undefined) onScore(next);
          }}
          className="font-headline h-auto w-full border-0 p-0 text-right text-[1.35rem] leading-none tabular-nums transition-none md:text-[1.35rem]"
        />
      </span>
    </div>
  );
}
