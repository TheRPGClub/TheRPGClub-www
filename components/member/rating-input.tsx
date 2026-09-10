"use client";

import { useEffect, useRef, useState } from "react";

import { Slider } from "@/components/ui/slider";
// The same slide the voting board's tally bars use, imported rather than
// restated so the two can never drift apart.
import { BAR_MOTION } from "@/components/voting/accents";
import {
  MAX_RATING,
  MIN_RATING,
  clampRating,
  parseRatingInput,
} from "@/lib/api/rating";
import { reviewAccents, type ReviewAccent } from "@/lib/reviews/accent";
import { cn } from "@/lib/utils";

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
 * The 0..100 rating control.
 *
 * The score readout is itself the text field, so the number you read is the
 * number you type — which is also why there are no spinner arrows to hide.
 * The ramp beneath it runs light to dark across the scale, faint for the part
 * of the scale you haven't given and full strength for the part you have.
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
  const [live, setLive] = useState(false);
  const liveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearLiveTimer = () => {
    if (liveTimer.current) clearTimeout(liveTimer.current);
    liveTimer.current = null;
  };

  const markLive = () => {
    setLive(true);
    clearLiveTimer();
    liveTimer.current = setTimeout(() => setLive(false), LIVE_TIMEOUT_MS);
  };

  const settle = () => {
    clearLiveTimer();
    setLive(false);
  };

  useEffect(() => clearLiveTimer, []);

  return (
    <div className="space-y-2.5">
      <div className="flex items-baseline justify-between gap-4">
        {/* The "/ 100" is the label — a separate "Rating" heading would say
            nothing the scale and the slider don't already say. */}
        <div className="flex items-baseline gap-1.5">
          <span className="relative inline-flex flex-col">
            <input
              // A text field rather than a number field: no spinner arrows,
              // and `parseRatingInput` owns the filtering instead.
              type="text"
              inputMode="numeric"
              autoComplete="off"
              maxLength={3}
              disabled={disabled}
              placeholder="—"
              aria-label={`Rating out of ${MAX_RATING}`}
              value={value ?? ""}
              onChange={(e) => {
                const next = parseRatingInput(e.target.value);
                // undefined means the keystroke wasn't a digit — ignore it
                // rather than letting it clear a score already set.
                if (next !== undefined) onChange(next);
              }}
              className={cn(
                "peer w-[3ch] border-0 bg-transparent p-0 text-right text-4xl font-semibold tabular-nums tracking-tighter outline-none",
                "placeholder:font-normal placeholder:text-muted-foreground/60",
                "transition-[transform,filter] duration-200 ease-out origin-right",
                "motion-reduce:transition-none",
                unset ? "text-muted-foreground" : style.readout,
                // The whole flourish: while the slider drives the value the
                // readout lifts and picks up the accent's glow, then settles.
                // `motion-reduce:scale-100` and not just `transition-none`:
                // without it the readout would still jump to the larger size,
                // it just wouldn't animate there. The glow stays either way.
                live &&
                  !unset &&
                  cn("scale-[1.12] motion-reduce:scale-100", style.glow),
                disabled && "opacity-50",
              )}
            />
            {/* Doubles as the focus indicator, since the field carries no
                border of its own. */}
            <span
              aria-hidden
              className={cn(
                "mt-0.5 h-px w-full origin-right scale-x-0 rounded-full transition-transform duration-200 ease-out",
                "peer-hover:scale-x-100 peer-focus:h-0.5 peer-focus:scale-x-100",
                "motion-reduce:transition-none",
                style.caret,
              )}
            />
          </span>
          <span className="text-sm text-muted-foreground tabular-nums">
            / {MAX_RATING}
          </span>
        </div>

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
          markLive();
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
        trackClassName={cn(
          "bg-transparent bg-linear-to-r data-horizontal:h-2",
          style.track,
        )}
        // `bg-transparent` clears the primitive's solid fill; the ramp is a
        // background-image over it.
        indicatorClassName={cn(
          "bg-transparent bg-linear-to-r",
          style.fill,
          live ? "transition-none" : FILL_SLIDING,
        )}
        thumbClassName={cn(
          "size-4 border-2",
          // A halo in the page colour, so the thumb reads against the ramp it
          // sits on — a red thumb on a red fill needs the separation.
          "shadow-[0_0_0_3px_var(--background)]",
          live ? THUMB_TRACKING : THUMB_SLIDING,
          "hover:scale-110 active:scale-110 motion-reduce:transition-none motion-reduce:hover:scale-100",
          style.thumb,
        )}
      />
    </div>
  );
}
