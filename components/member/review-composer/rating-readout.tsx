"use client";

import { Input } from "@/components/ui/input";
import { MAX_RATING, parseRatingInput } from "@/lib/api/rating";
import { reviewAccents, type ReviewAccent } from "@/lib/reviews/accent";
import { cn } from "@/lib/utils";

// The rating's score readout, which is itself the text field: the number you
// read is the number you type, which is also why there are no spinner arrows
// to hide. The "/ 100" is the label: a separate "Rating" heading would say
// nothing the scale and the slider don't already say.
export function RatingReadout({
  value,
  onChange,
  accent,
  live,
  disabled,
}: {
  value: number | null;
  onChange: (next: number | null) => void;
  accent: ReviewAccent;
  // While the slider drives the value, the readout lifts.
  live: boolean;
  disabled?: boolean;
}) {
  const style = reviewAccents[accent];
  const unset = value === null;
  const lifted = live && !unset;

  return (
    <div className="flex items-baseline gap-1.5">
      {/* The readout's ink (and, while lifted, the accent's glow) is carried
          by the box around the field. */}
      <span
        className={cn(
          "relative inline-flex flex-col",
          unset ? "text-muted-foreground" : style.readout,
          lifted && style.glow,
        )}
      >
        <Input
          variant="bare"
          // A text field rather than a number field: no spinner arrows, and
          // `parseRatingInput` owns the filtering instead.
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
            // undefined means the keystroke wasn't a digit — ignore it rather
            // than letting it clear a score already set.
            if (next !== undefined) onChange(next);
          }}
          className={cn(
            "peer h-auto w-[3ch] border-0 p-0 text-right text-4xl font-semibold tabular-nums tracking-tighter md:text-4xl",
            "placeholder:font-normal",
            "origin-right transition-[transform,filter] duration-200 ease-out",
            "motion-reduce:transition-none",
            // The whole flourish: while the slider drives the value the
            // readout lifts, then settles. `motion-reduce:scale-100` and not
            // just `transition-none`: without it the readout would still jump
            // to the larger size, it just wouldn't animate there.
            lifted && "scale-[1.12] motion-reduce:scale-100",
          )}
        />
        {/* Doubles as the focus indicator, since the field carries no border
            of its own. */}
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
      <span className="text-sm text-muted-foreground tabular-nums">/ {MAX_RATING}</span>
    </div>
  );
}
