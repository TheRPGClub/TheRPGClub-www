import { MIN_RATING } from "@/lib/api/rating";
import { MAX_FACETS, REVIEW_TEMPLATES, WEIGHT_TOTAL, facetDef } from "@/lib/reviews/facets";

// What the scorecard explainer says: one term per rule that the controls
// don't make guessable.
//
// Term left, explanation right. The two-column grid this replaced
// sized every row to its tallest cell, so the Templates entry —
// three times the height of the shortest — left a hole beside it.
// Here the hierarchy is positional, which is why the terms need no
// capitals or extra weight to read as a level above the prose.
// Everything in the dialog starts on one left edge: title, preamble
// and every term. Right-aligning the terms against the gutter ties
// each one to its definition, but it lands them mid-column with
// nothing above to line up with, which reads as a misalignment
// rather than a treatment.
export function ExplainerEntries() {
  return (
    <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-[10.5rem_1fr]">
      <Entry term="Templates">
        The dropdown lays out a set of categories to grade. Nothing is fixed
        after that: rename a row, move it, remove it, or add your own.
        Picking a template again restores its categories and keeps the
        scores you have already given.
        {/* Listed from the templates themselves, so this cannot quietly
            fall out of step with what the dropdown offers. */}
        <span className="mt-2.5 block space-y-1.5 border-l border-border pl-3">
          {REVIEW_TEMPLATES.map((template) => (
            <span key={template.key} className="block text-xs leading-snug">
              <span className="font-medium text-foreground">
                {template.label}:
              </span>
              <span className="text-muted-foreground">
                {" "}
                {template.facets.length > 0
                  ? template.facets
                      .map((key) => facetDef(key)?.label ?? key)
                      .join(", ")
                  : template.blurb.replace(/\.$/, "")}
              </span>
            </span>
          ))}
        </span>
      </Entry>

      <Entry term="Renaming a category">
        Call it whatever the game calls it: Job System, Materia,
        Stand Arrows. Underneath it stays the club&rsquo;s Combat category,
        so it still counts when we line up combat scores across everyone
        else&rsquo;s reviews. That is why renaming a close-enough row beats
        inventing a new one.
      </Entry>

      <Entry term="Your own categories">
        For anything no template anticipated. A category you invent lives on
        this review alone, so it will not appear in any club-wide
        comparison. {MAX_FACETS} categories in total is the ceiling.
      </Entry>

      <Entry term="Weights">
        Each category takes a share of {WEIGHT_TOTAL}%. They start out even,
        and you only need to touch them if you disagree. Push story
        up and visuals down if that is how the game landed for you. The
        shares have to total {WEIGHT_TOTAL}%, and there are buttons to
        rebalance them if they drift.
      </Entry>

      <Entry term="Blank rows">
        An unscored category drops out of the average rather than dragging
        it down. A deliberate {MIN_RATING} does count, because zero is a
        real opinion.
      </Entry>

      <Entry term="Your overall score">
        The scorecard suggests an average and offers to use it, but it never
        overwrites what you set at the top. A game whose parts average 78
        can still be a 90, that distance is usually the most
        interesting thing in a review.
      </Entry>
    </dl>
  );
}

function Entry({
  term,
  children,
}: {
  term: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <dt className="text-sm font-medium text-foreground">{term}</dt>
      <dd className="text-sm leading-relaxed text-muted-foreground">
        {children}
      </dd>
    </>
  );
}
