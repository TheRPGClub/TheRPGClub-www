import { RotateCcw } from "lucide-react";

import { ButtonLink } from "@/components/ui/button";
import { reviewHref } from "@/lib/reviews/href";
import { cn } from "@/lib/utils";
import { SPINE_LINE } from "./take-stop";

// The grid every stop on the score line shares (TakeRow's, without the
// scorecard margin's content).
export const STOP_ROW =
  "relative grid grid-cols-[minmax(0,1fr)] gap-y-3 pb-8 md:grid-cols-[150px_minmax(0,1fr)] md:gap-x-10 xl:grid-cols-[190px_minmax(0,66ch)_minmax(13rem,1fr)]";

// The dashed stretch of spine from a waiting stop down to the newest take.
export function DashedSpine() {
  return (
    <span
      aria-hidden
      className={cn(
        "absolute top-5.5 -bottom-2 hidden w-0.5 bg-[repeating-linear-gradient(180deg,var(--color-border-strong)_0_5px,transparent_5px_10px)] md:block",
        SPINE_LINE,
      )}
    />
  );
}

// A waiting stop's marker: a yellow ring, filled in its middle.
export function PencilDot({ hollow = false }: { hollow?: boolean }) {
  return (
    <span
      aria-hidden
      className="absolute top-1.5 -right-[27px] z-1 hidden size-3.5 rounded-[2px] shadow-[inset_0_0_0_2px_var(--color-highlight)] md:block"
    >
      {!hollow && <span className="absolute inset-1 bg-highlight" />}
    </span>
  );
}

// The top of the score line, for the author only: a yellow stop waiting for
// the next take. Revisit starts a Draft Revision; nothing below it moves
// until that is published.
export function RevisitStop({ reviewId }: { reviewId: number }) {
  return (
    <section aria-label="Revisit" className={STOP_ROW}>
      <DashedSpine />
      <div className="relative text-right max-md:hidden">
        <PencilDot />
        <span className="font-label block text-[0.74rem] leading-[1.4] font-extrabold tracking-[0.08em] text-highlight uppercase">
          Next take
        </span>
      </div>
      <div>
        <p className="m-0 max-w-[56ch] text-[0.95rem] text-dim-foreground">
          <b className="font-semibold text-foreground">Played it again?</b> Revisit to add a new take
          with its own score. Everything below stays as it is.
        </p>
        <ButtonLink href={reviewHref(reviewId, { revisit: true })} variant="highlight" className="mt-3">
          <RotateCcw />
          Revisit
        </ButtonLink>
      </div>
    </section>
  );
}
