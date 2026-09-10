"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, ChevronUp, Pencil, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MAX_RATING, MIN_RATING, clampRating, parseRatingInput } from "@/lib/api/rating";
import {
  MAX_FACETS,
  MAX_LABEL_LENGTH,
  REVIEW_FACETS,
  REVIEW_TEMPLATES,
  WEIGHT_TOTAL,
  applyTemplate,
  deriveWeights,
  evenWeights,
  facetAverage,
  facetDef,
  ensureWeights,
  facetHint,
  matchesTemplate,
  nextCustomKey,
  rebalanceWeights,
  templateChoice,
  weightsError,
  weightsTotal,
  type FacetKey,
  type ReviewFacets,
} from "@/lib/reviews/facets";
import { reviewAccents, type ReviewAccent } from "@/lib/reviews/accent";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScorecardExplainer } from "./scorecard-explainer";

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
  const style = reviewAccents[accent];
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
  const choice = templateChoice(value);
  // A template seeds a card and then gets out of the way — every row is
  // editable whichever preset it came from. `edited` only drives a marker.
  const edited = value !== null && !matchesTemplate(value);
  const average = facetAverage(value);
  const total = weightsTotal(value);
  const budgetError = weightsError(value);
  // "Even split" is offered whenever it would change something, so a card
  // already sitting on an even split doesn't advertise a no-op button.
  const isEvenlySplit =
    value?.weights !== undefined &&
    JSON.stringify(value.weights) === JSON.stringify(evenWeights(value.order));

  const setScore = (key: FacetKey, score: number | null) => {
    if (!value) return;
    const scores = { ...value.scores };
    if (score === null) {
      delete scores[key];
    } else {
      scores[key] = score;
    }
    onChange({ ...value, scores });
  };

  const withWeights = (next: ReviewFacets) => ensureWeights(next) ?? next;

  const setOrder = (order: FacetKey[]) => {
    if (!value) return;
    // Dropping a facet drops its score with it, so a removed row can never
    // keep contributing to the average from off the card.
    const scores: Record<string, number> = {};
    for (const key of order) {
      const score = value.scores[key];
      if (score !== undefined) scores[key] = score;
    }
    // A structural edit overwrites nothing the reviewer typed, so the budget
    // re-apportions itself rather than being left short. Typing a weight is
    // the opposite case and deliberately does not come through here.
    const labels: Record<string, string> = {};
    for (const key of order) {
      const label = value.labels?.[key];
      if (label) labels[key] = label;
    }

    const next: ReviewFacets = { ...value, order, scores };
    if (Object.keys(labels).length > 0) {
      next.labels = labels;
    } else {
      delete next.labels;
    }
    const weights = deriveWeights(order, value.weights);
    if (weights) {
      next.weights = weights;
    } else {
      delete next.weights;
    }
    onChange(withWeights(next));
  };

  const setWeight = (key: FacetKey, weight: number) => {
    if (!value?.weights) return;
    onChange({ ...value, weights: { ...value.weights, [key]: weight } });
  };

  const setLabel = (key: FacetKey, label: string) => {
    if (!value) return;
    const labels = { ...value.labels };
    const trimmed = label.slice(0, MAX_LABEL_LENGTH);
    // Renaming a catalogue row back to its own name leaves no override, so a
    // card cannot silently accumulate labels that say nothing.
    if (!trimmed.trim() || trimmed === facetDef(key)?.label) {
      delete labels[key];
    } else {
      labels[key] = trimmed;
    }
    const next: ReviewFacets = { ...value, labels };
    if (Object.keys(labels).length === 0) delete next.labels;
    onChange(next);
  };

  const addCustomFacet = () => {
    if (!value) return;
    const key = nextCustomKey(value.order);
    const order = [...value.order, key];
    // Named up front: a custom row is nothing but its name, and the sanitizer
    // drops one that has none. The reviewer types over this straight away.
    const labels = { ...value.labels, [key]: "New category" };
    const next: ReviewFacets = { ...value, order, labels };
    const weights = deriveWeights(order, value.weights);
    if (weights) next.weights = weights;
    setAddedKey(key);
    onChange(withWeights(next));
  };

  const move = (index: number, delta: number) => {
    if (!value) return;
    const next = [...value.order];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setOrder(next);
  };

  const unpicked = REVIEW_FACETS.filter(
    (facet) => !value?.order.includes(facet.key),
  );

  return (
    <section className="space-y-3 rounded-lg border border-border/60 bg-background/40 p-3">
      {/* Two sides, one job each: what this section is on the left, what you
          can change on the right. The card already works this way lower down —
          the row controls and the weights footer both put their label left and
          their actions right — so the control belongs on the right rather than
          wedged between two pieces of static text. */}
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

          {/* Switching is not destructive: a category the new template also
              carries keeps its score and its name, and Custom keeps the card
              exactly as it stands. What each template holds is in the
              explainer. */}
          <DropdownMenu>
            {/* Children outside the render element, matching how every other
                trigger in the app is written. */}
            <DropdownMenuTrigger
              disabled={disabled}
              render={<Button type="button" variant="outline" size="xs" />}
            >
              {
                REVIEW_TEMPLATES.find((template) => template.key === choice)
                  ?.label
              }
              <ChevronDown className="text-muted-foreground transition-transform group-aria-expanded/button:rotate-180" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-w-72">
              {/* Radio items, because exactly one template is applied at a
                  time — checkboxes would announce four independent on/off
                  states to a screen reader. The apply hangs off `onClick`
                  rather than the group's `onValueChange`, so picking the
                  template already showing still fires: re-applying a preset is
                  how an over-edited card gets back to a known shape, and a
                  change-only handler would make that click do nothing. */}
              <DropdownMenuRadioGroup value={choice}>
                {REVIEW_TEMPLATES.map((template) => (
                  <DropdownMenuRadioItem
                    key={template.key}
                    value={template.key}
                    onClick={() => {
                      // A row queued to open its rename field belongs to the
                      // card being replaced; carrying it across would reopen
                      // a name on the rebuilt one.
                      setAddedKey(null);
                      setRebuild((n) => n + 1);
                      onChange(applyTemplate(value, template.key));
                    }}
                    closeOnClick
                  >
                    <span className="block">
                      <span className="block">{template.label}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {template.blurb}
                      </span>
                    </span>
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {value && value.order.length > 0 && (
        <div key={rebuild} className="space-y-1.5">
          {value.order.map((key, index) => (
            // The wrapper carries the entrance so `FacetRow` stays a control
            // and knows nothing about how it arrived. `backwards` fill keeps a
            // delayed row hidden until its turn instead of flashing at full
            // opacity first, and the stagger is capped so a twelve-row card
            // does not turn the rebuild into a wait.
            <div
              key={key}
              className={cn(
                "animate-in fade-in slide-in-from-top-1 duration-200 ease-out",
                "[animation-fill-mode:backwards] motion-reduce:animate-none",
              )}
              style={{ animationDelay: `${Math.min(index, 8) * 25}ms` }}
            >
              <FacetRow
                facetKey={key}
                score={value.scores[key]}
                weight={value.weights?.[key]}
                accent={accent}
                disabled={disabled}
                onScore={(score) => setScore(key, score)}
                onWeight={(weight) => setWeight(key, weight)}
                label={value.labels?.[key] ?? facetDef(key)?.label ?? ""}
                autoEdit={key === addedKey}
                onLabel={(label) => setLabel(key, label)}
                controls={{
                  onUp: index > 0 ? () => move(index, -1) : undefined,
                  onDown:
                    index < value.order.length - 1
                      ? () => move(index, 1)
                      : undefined,
                  onRemove: () =>
                    setOrder(value.order.filter((other) => other !== key)),
                }}
              />
            </div>
          ))}
        </div>
      )}

      {value && (
        <div className="flex flex-wrap items-center gap-1">
          {unpicked.map((facet) => (
            <Tooltip key={facet.key}>
              <TooltipTrigger
                render={
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    disabled={disabled || value.order.length >= MAX_FACETS}
                    onClick={() => setOrder([...value.order, facet.key])}
                  />
                }
              >
                <Plus />
                {facet.label}
              </TooltipTrigger>
              <TooltipContent>{facet.hint}</TooltipContent>
            </Tooltip>
          ))}

          {/* Nothing in the catalogue fits? Name your own. It lives on this
              review only — the club can average `music` across everyone's
              reviews, but not a field one person invented — so renaming a
              catalogue row is the better move where one is close enough. */}
          <Button
            type="button"
            variant="ghost"
            size="xs"
            disabled={disabled || value.order.length >= MAX_FACETS}
            onClick={addCustomFacet}
            className="text-muted-foreground"
          >
            <Plus />
            Add your own
          </Button>

          {value.order.length >= MAX_FACETS && (
            <span className="text-xs text-muted-foreground">
              {MAX_FACETS} categories is the limit.
            </span>
          )}
        </div>
      )}

      {value?.order.length === 0 && (
        <p className="text-xs text-muted-foreground">
          Pick the categories you want to grade this one on.
        </p>
      )}

      {value && value.order.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-border/60 pt-2.5 text-xs">
          {budgetError ? (
            // Named rather than silently corrected: rewriting a number someone
            // just typed is worse than telling them it doesn't add up yet.
            <p role="alert" className="text-destructive">
              {budgetError}
            </p>
          ) : (
            <p className="text-muted-foreground">
              Weights use all{" "}
              <span className="font-semibold tabular-nums">{WEIGHT_TOTAL}%</span>
            </p>
          )}
          <div className="flex items-center gap-1">
            {budgetError && (
              <Button
                type="button"
                variant="outline"
                size="xs"
                disabled={disabled}
                onClick={() =>
                  onChange({
                    ...value,
                    weights: rebalanceWeights(value.order, value.weights ?? {}),
                  })
                }
              >
                Scale to {WEIGHT_TOTAL}%
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="xs"
              disabled={disabled || total === WEIGHT_TOTAL && isEvenlySplit}
              onClick={() =>
                onChange({ ...value, weights: evenWeights(value.order) })
              }
            >
              Even split
            </Button>
          </div>
        </div>
      )}

      {average !== null && (
        <footer className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-border/60 pt-2.5 text-xs">
          <p className="text-muted-foreground">
            These average{" "}
            <span className={cn("font-semibold tabular-nums", style.readout)}>
              {average}
            </span>
          </p>
          {/* A suggestion, never a rule. The overall is the reviewer's verdict,
              and the gap between it and the arithmetic is usually the most
              interesting thing on the page. */}
          {overall === average ? (
            <span className="text-muted-foreground">Matches your overall</span>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="xs"
              disabled={disabled}
              onClick={() => onUseAverage(average)}
            >
              Use as overall
            </Button>
          )}
        </footer>
      )}
    </section>
  );
}

interface FacetRowControls {
  onUp?: () => void;
  onDown?: () => void;
  onRemove: () => void;
}

function FacetRow({
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
  controls?: FacetRowControls;
}) {
  const style = reviewAccents[accent];
  // A row the reviewer just invented opens in edit mode: it arrives called
  // "New category", which is a placeholder rather than a name, and making them
  // hunt for the pencil to fix that would be the wrong first step. Safe as an
  // initial value because a new row is a new React key, so a fresh mount.
  const [editing, setEditing] = useState(autoEdit);
  const [draft, setDraft] = useState(label);
  const inputRef = useRef<HTMLInputElement>(null);
  const pencilRef = useRef<HTMLButtonElement>(null);
  // Escape unmounts a focused input, and a browser may fire blur on the way
  // out — which would run `commit` and save the draft Escape just discarded.
  const discarding = useRef(false);
  const wasEditing = useRef(false);
  // A custom row has no catalogue entry behind it, so no hint to offer.
  const hint = facetHint(facetKey);
  const unset = score === undefined;
  // Falls back to the key only if a custom row somehow lost its name; the
  // sanitizer drops those, so this is belt and braces for the live editor,
  // where a name can be empty mid-edit.
  const named = label || facetDef(facetKey)?.label || "This category";

  // Selected rather than merely focused: a row opened for renaming usually
  // wants replacing, and "New category" always does. On the way back out the
  // pencil takes focus again, so finishing a rename with the keyboard leaves
  // you where you started instead of at the top of the page.
  useEffect(() => {
    if (editing) {
      wasEditing.current = true;
      inputRef.current?.select();
    } else if (wasEditing.current) {
      wasEditing.current = false;
      pencilRef.current?.focus();
    }
  }, [editing]);

  const startEditing = () => {
    discarding.current = false;
    setDraft(label);
    setEditing(true);
  };

  // Committed on the way out rather than per keystroke, which is what lets
  // Escape and the cross put the old name back.
  const commit = () => {
    if (!discarding.current) onLabel(draft);
    setEditing(false);
  };

  const cancel = () => {
    discarding.current = true;
    setDraft(label);
    setEditing(false);
  };

  return (
    <div className="flex items-center gap-2.5">
      {/* Names are settled until you say otherwise. Most rows keep the one
          the template gave them, so the default state is read — the pencil is
          what turns a row into something you are editing, and the tick and
          cross are how you leave. The field takes more room while it is open,
          which the slider lends it for as long as the rename lasts. */}
      {editing ? (
        <span
          className={cn(
            "flex w-40 shrink-0 items-center gap-0.5 rounded-md sm:w-56",
            "bg-background ring-1 ring-ring/60",
          )}
        >
          <input
            ref={inputRef}
            type="text"
            autoComplete="off"
            maxLength={MAX_LABEL_LENGTH}
            disabled={disabled}
            value={draft}
            placeholder={facetDef(facetKey)?.label ?? "Name this category"}
            aria-label={`Name of the ${named} category`}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              // This input lives inside the review's own form, so a bare
              // Enter would post the review rather than finish the rename.
              if (e.key === "Enter") {
                e.preventDefault();
                commit();
              }
              if (e.key === "Escape") {
                e.preventDefault();
                cancel();
              }
            }}
            className={cn(
              "min-w-0 flex-1 rounded-sm border-0 bg-transparent px-1 py-0.5 text-xs text-foreground outline-none",
              "placeholder:text-muted-foreground/60",
            )}
          />
          {/* Both buttons keep the caret where it is on mousedown. Without
              that the input blurs first, `commit` runs, and the cross saves
              the very draft it exists to throw away. `discarding` covers the
              same race for anything that gets past this — a touch keyboard
              dismissing, say. */}
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label={`Save the name for ${named}`}
            disabled={disabled}
            onMouseDown={(e) => e.preventDefault()}
            onClick={commit}
            className="text-muted-foreground hover:text-foreground"
          >
            <Check />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label={`Discard the name change for ${named}`}
            disabled={disabled}
            onMouseDown={(e) => {
              e.preventDefault();
              discarding.current = true;
            }}
            onClick={cancel}
            className="text-muted-foreground hover:text-destructive"
          >
            <X />
          </Button>
        </span>
      ) : (
        <span className="flex w-24 shrink-0 items-center gap-0.5 sm:w-36">
          {/* Double-click is the shortcut, not the affordance: it duplicates
              the pencil rather than replacing it, so nothing here is reachable
              only by knowing the trick. That is also why the text stays plain
              text — giving it a button role would put two tab stops on the
              same action. `select-none` suppresses the word-selection flash a
              double-click would otherwise leave behind as the field opens. */}
          <span
            className="min-w-0 flex-1 cursor-default truncate text-xs text-muted-foreground select-none"
            title={hint ?? undefined}
            onDoubleClick={() => {
              if (!disabled) startEditing();
            }}
          >
            {label}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            ref={pencilRef}
            aria-label={`Rename ${named}`}
            disabled={disabled}
            onClick={startEditing}
            className="text-muted-foreground hover:text-foreground"
          >
            <Pencil />
          </Button>
        </span>
      )}

      <Slider
        className="min-w-0 flex-1"
        // An unscored facet rests at the floor with the readout showing "—",
        // so it never passes for a deliberate 0 — which is a real score here.
        value={score ?? MIN_RATING}
        onValueChange={(next) =>
          onScore(clampRating(typeof next === "number" ? next : next[0]))
        }
        min={MIN_RATING}
        max={MAX_RATING}
        step={1}
        disabled={disabled}
        getAriaLabel={() => `${named}, out of ${MAX_RATING}`}
        getAriaValueText={() =>
          unset ? "Not scored" : `${score} out of ${MAX_RATING}`
        }
        trackClassName={cn(
          "bg-transparent bg-linear-to-r data-horizontal:h-1",
          style.track,
        )}
        indicatorClassName={cn(
          "bg-transparent bg-linear-to-r",
          style.fill,
          unset && "opacity-0",
        )}
        thumbClassName={cn(
          "size-2.5 border shadow-[0_0_0_2px_var(--background)]",
          style.thumb,
        )}
      />

      <input
        // Same contract as the overall's readout: a text field so it carries
        // no spinner arrows, with `parseRatingInput` owning the filtering.
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
        className={cn(
          "w-[3ch] shrink-0 rounded border-0 bg-transparent p-0 text-right text-xs font-semibold tabular-nums outline-none",
          "placeholder:font-normal placeholder:text-muted-foreground/60",
          "hover:bg-muted/60 focus:bg-muted/60",
          unset ? "text-muted-foreground" : style.readout,
        )}
      />

      {weight !== undefined && (
        <span className="flex shrink-0 items-baseline gap-px">
          <input
            type="text"
            inputMode="numeric"
            autoComplete="off"
            maxLength={3}
            disabled={disabled}
            aria-label={`${named}, share of the ${WEIGHT_TOTAL}% weighting`}
            value={weight}
            onChange={(e) => {
              // Shares the score field's parser: it already filters to digits
              // and clamps to 0..100, which is exactly the budget's range.
              // Emptying the field reads as 0%, not as "no weight": every row
              // has a share, and a share of nothing is a real answer. It just
              // has to be made up elsewhere for the split to add up.
              const next = parseRatingInput(e.target.value);
              if (next !== undefined) onWeight(next ?? 0);
            }}
            className={cn(
              "w-[3ch] rounded border-0 bg-transparent p-0 text-right text-xs tabular-nums text-muted-foreground outline-none",
              "hover:bg-muted/60 focus:bg-muted/60",
            )}
          />
          <span aria-hidden className="text-[10px] text-muted-foreground">
            %
          </span>
        </span>
      )}

      {controls && (
        <div className="flex shrink-0 items-center">
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label={`Move ${named} up`}
            disabled={disabled || !controls.onUp}
            onClick={controls.onUp}
          >
            <ChevronUp />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label={`Move ${named} down`}
            disabled={disabled || !controls.onDown}
            onClick={controls.onDown}
          >
            <ChevronDown />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label={`Remove ${named}`}
            disabled={disabled}
            onClick={controls.onRemove}
          >
            <X />
          </Button>
        </div>
      )}
    </div>
  );
}
