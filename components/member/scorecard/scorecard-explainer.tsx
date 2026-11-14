"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { reviewAccents, type ReviewAccent } from "@/lib/reviews/accent";
import { cn } from "@/lib/utils";
import { ExplainerEntries } from "./explainer-entries";

/**
 * The "What's this?" link over the scorecard, and what it opens.
 *
 * The scorecard has a few rules that are not guessable from the controls —
 * that renaming a category keeps its identity, that a blank row is skipped
 * rather than counted as zero, that the average never overrides the score you
 * gave. None of those fit in a tooltip, and all of them change how someone
 * fills the thing in.
 */
export function ScorecardExplainer({
  accent = "neutral",
}: {
  // The game's category, so the dialog wears the same hue as the composer it
  // was opened from — red for a GOTM winner, purple for a Non-RPG one, plain
  // white for everything else.
  accent?: ReviewAccent;
}) {
  const style = reviewAccents[accent];

  return (
    <Dialog>
      <DialogTrigger
        render={<Button type="button" variant="help" className="h-auto border-0 p-0 text-xs" />}
      >
        What&rsquo;s this?
      </DialogTrigger>

      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle variant="help" className="text-lg">
            About the scorecard
          </DialogTitle>
          {/* Brightest at the leading edge and fading out to the right, so it
              needs no end cap and never runs into the close button. */}
          <span
            aria-hidden
            className={cn(
              "mt-0.5 mb-1 h-0.5 w-full rounded-full bg-linear-to-r",
              style.rule,
            )}
          />
          {/* Capped well short of the dialog: the popup is wide so the
              reference below can sit in two columns, not so a sentence can run
              a hundred characters. */}
          <DialogDescription className="max-w-prose">
            An optional breakdown of your score, category by category. Skip it
            and your review is a number and your words, which is a perfectly
            good review.
          </DialogDescription>
        </DialogHeader>

        <ExplainerEntries />
      </DialogContent>
    </Dialog>
  );
}
