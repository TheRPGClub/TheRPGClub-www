"use client";

import { Input } from "@/components/ui/input";
import { MAX_RATING, parseRatingInput } from "@/lib/api/rating";
import { cn } from "@/lib/utils";

// The rating's score readout, which is itself the text field: the number you
// read is the number you type, which is also why there are no spinner arrows
// to hide. The "/ 100" is the label: a separate "Rating" heading would say
// nothing the scale and the slider don't already say.
//
// Set as an Anton numeral. On the review desk it is big and circled in yellow
// pencil, the editor's mark on the one number that matters; in the quick
// composer it sits smaller beside its ruler.
export function RatingReadout({
  value,
  onChange,
  live,
  size = "desk",
  disabled,
  ringed = true,
}: {
  value: number | null;
  onChange: (next: number | null) => void;
  live: boolean;
  size?: "desk" | "quick";
  disabled?: boolean;
  // The desk's pencil ring marks the score as there to change; a locked one
  // has none.
  ringed?: boolean;
}) {
  const unset = value === null;
  const desk = size === "desk";

  return (
    <div className="flex items-end gap-2">
      <span data-slot="rating-readout" data-size={desk ? "desk" : "quick"} className={cn("relative inline-flex", desk && "h-[5.75rem] w-[9rem] items-center justify-center")}>
        {desk && ringed && <PencilRing dashed={unset} />}
        <Input
          variant="bare"
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
            if (next !== undefined) onChange(next);
          }}
          className={cn(
            "font-headline relative h-auto border-0 p-0 text-center leading-[0.8] tabular-nums",
            desk ? "w-full text-[5.5rem] md:text-[5.5rem]" : "w-[2.2ch] text-[3.4rem] md:text-[3.4rem]",
            "origin-bottom transition-transform duration-200 ease-out motion-reduce:transition-none",
            live && !unset && "scale-[1.06] motion-reduce:scale-100",
          )}
        />
      </span>
      <span className="font-label mb-1 text-[0.8rem] font-extrabold tracking-[0.08em] text-faint-foreground">
        / {MAX_RATING}
      </span>
    </div>
  );
}

// A hand-drawn yellow ring, open where the pencil lifted. Dashed while there
// is no score yet: the place a score goes, pencilled in.
function PencilRing({ dashed }: { dashed: boolean }) {
  return (
    <svg
      aria-hidden
      data-slot="pencil-ring"
      viewBox="0 0 100 60"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 size-full text-highlight"
    >
      <path
        d="M8 34 C 4 12, 40 2, 70 6 S 99 30, 88 46 S 30 60, 12 46 S 6 26, 22 14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeDasharray={dashed ? "4 4" : undefined}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
