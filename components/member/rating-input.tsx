"use client";

import { Slider } from "@/components/ui/slider";
// The same slide the voting board's tally bars use, imported rather than
// restated so the two can never drift apart.
import { BAR_MOTION } from "@/components/voting/accents";
import { MAX_RATING, MIN_RATING, clampRating } from "@/lib/api/rating";
import { reviewAccents, type ReviewAccent } from "@/lib/reviews/accent";
import { cn } from "@/lib/utils";
import { useLiveFlag } from "@/hooks/use-live-flag";
import { RatingReadout } from "./review-composer/rating-readout";

// How long the readout stays "live" after the last slider movement, if the
// slider never reports a commit (a pointer released off-window, say). Long
// enough that a slow drag doesn't flicker, short enough not to linger.
const LIVE_TIMEOUT_MS = 700;

// Typing lands the score in one jump, and each keystroke would otherwise
// restart the slide. The quarter-second delay is what debounces it, in CSS
// alone: a transition that hasn't started yet is replaced by the next
// keystroke's, so the fill holds still while you type and glides once, a
// quarter-second after you stop. No timer, and no second copy of the value.
//
// Dragging must not ease at all — the fill has to stay under the pointer — so
// both drop the positional transition while the slider is live.
const FILL_SLIDING = cn(BAR_MOTION, "delay-250");

// Written as `transition-[...]` utilities rather than a `[transition:...]`
// shorthand so tailwind-merge can see them: the slider primitive's thumb
// ships `transition-[color,box-shadow]`, and only the utility form lands in
// the same group and replaces it. A shorthand sits in a different group, and
// the two would race on stylesheet order instead.
//
// The paired duration and delay lists are arbitrary because the thumb's two
// jobs want different timings, in the property order above: it travels with
// the fill (500ms, after the same quarter-second wait), while its hover feedback
// stays quick and immediate — a delay there would make the thumb feel dead
// under the cursor.
const THUMB_SLIDING =
  "transition-[inset-inline-start,box-shadow,transform] [transition-duration:500ms,150ms,150ms] [transition-delay:250ms,0ms,0ms] ease-out";
const THUMB_TRACKING =
  "transition-[box-shadow,transform] duration-150 ease-out";

export interface RatingInputProps {
  // null means "not rated yet", which is distinct from a score of 0 — 0 is a
  // legitimate rating on this scale, so an empty control cannot stand in for
  // it. The form keeps submit disabled until this is a number.
  value: number | null;
  onChange: (next: number | null) => void;
  accent?: ReviewAccent;
  disabled?: boolean;
}

/**
 * The 0..100 rating control: the score readout you can type into, and the
 * ramp beneath it, which runs light to dark across the scale, faint for the
 * part of the scale you haven't given and full strength for the part you
 * have.
 */
export function RatingInput({
  value,
  onChange,
  accent = "neutral",
  disabled,
}: RatingInputProps) {
  const style = reviewAccents[accent];
  const unset = value === null;
  // True while the slider is being moved, which is the only thing that
  // animates the readout — typing sets the number without the flourish.
  const { live, mark, settle } = useLiveFlag(LIVE_TIMEOUT_MS);

  return (
    <div className="space-y-2.5">
      <div className="flex items-baseline justify-between gap-4">
        <RatingReadout
          value={value}
          onChange={onChange}
          accent={accent}
          live={live}
          disabled={disabled}
        />

        {style.label && (
          <span className="truncate text-xs text-muted-foreground">
            {style.label}
          </span>
        )}
      </div>

      <Slider
        // An unset rating still has to put the thumb somewhere; it rests at
        // the floor, and the readout above shows "—" so it doesn't pass for a
        // score of 0.
        value={value ?? MIN_RATING}
        onValueChange={(next) => {
          mark();
          onChange(clampRating(typeof next === "number" ? next : next[0]));
        }}
        onValueCommitted={settle}
        min={MIN_RATING}
        max={MAX_RATING}
        step={1}
        disabled={disabled}
        getAriaLabel={() => `Rating out of ${MAX_RATING}`}
        getAriaValueText={() =>
          unset ? "Not rated" : `${value} out of ${MAX_RATING}`
        }
        tone={style.sliderTone}
        trackClassName="data-horizontal:h-2"
        indicatorClassName={live ? "transition-none" : FILL_SLIDING}
        thumbClassName={cn(
          "size-4 border-2",
          live ? THUMB_TRACKING : THUMB_SLIDING,
          "hover:scale-110 active:scale-110 motion-reduce:transition-none motion-reduce:hover:scale-100",
        )}
      />
    </div>
  );
}
