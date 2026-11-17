"use client";

import type { ChallengeFormState, RuleWordKey } from "@/hooks/use-challenge-form";
import { EDITOR_ID } from "@/components/challenges/form/rule-sentence";
import { SourceSearch } from "@/components/challenges/form/source-search";
import { DayEditor } from "@/components/challenges/form/day-editor";
import { EndDateEditor, ScheduleEditor, TargetEditor } from "@/components/challenges/form/word-controls";
import { FirstYearEditor, LastYearEditor, PastPlayEditor } from "@/components/challenges/form/slots-word-controls";

const TITLE: Record<RuleWordKey, string> = {
  target: "Games to Clear",
  sources: "Built from",
  "season-start": "Season starts",
  "season-end": "Season ends",
  schedule: "When it's open",
  "ends-on": "Last Open day",
  "signup-cutoff": "Sign-up cutoff",
  "pick-deadline": "Pick deadline",
  reveal: "Reveal",
  "slots-first": "First year",
  "slots-last": "Last year",
  "past-play": "Counts past play",
};

const CALENDAR_FIELD = { "signup-cutoff": "signupCutoff", "pick-deadline": "pickDeadline", reveal: "reveal" } as const;

const HELP: Record<RuleWordKey, string> = {
  target:
    "How many games from the Pool a member Clears to Finish, or every game. A member can keep Clearing after they Finish.",
  sources:
    "Every game in a franchise or collection joins the Pool, and new ones join by themselves. Leave a game out, or add one by hand, on the covers below.",
  "season-start": "The Season repeats every year. It can cross the new year: end it before it starts.",
  "season-end": "The Season repeats every year. It can cross the new year: end it before it starts.",
  schedule:
    "“Every year” makes it Seasonal: only play inside the Season counts. “Any time” keeps it Always Open, with an optional end date.",
  "ends-on":
    "The last day it's Open, in the club's time zone. It can still change after Runs start, until that day has passed.",
  "signup-cutoff":
    "Sign-up closes as this day starts, and the draw happens on it. A change applies from the next Edition (or this one, while nobody has signed up).",
  "pick-deadline":
    "Santas pick until this day starts; then a missed pick becomes a random game from the backlog.",
  reveal:
    "Every game is revealed on this day, and members have until it comes round again to Clear theirs. The Edition is named by its year.",
  "slots-first":
    "Each member's birth year starts every Run at the member's own birth year: they're told it will show on their Run, and the full date never does. Or start every Run at one year.",
  "slots-last":
    "The current year keeps the range growing: a new year opens every 1 January, and members are Caught Up rather than Finished. Or end every Run at one year.",
  "past-play":
    "Counting past play lets members pick a Game Completion from before their Run started for an open year. Only for Challenges open any time.",
};

const ERROR_OF: Partial<Record<RuleWordKey, keyof ChallengeFormState["errors"]>> = {
  target: "target",
  sources: "sources",
  "season-start": "season",
  "season-end": "season",
  "ends-on": "endsOn",
  "signup-cutoff": "calendar",
  "pick-deadline": "calendar",
  reveal: "calendar",
  "slots-first": "slotsFirst",
  "slots-last": "slotsLast",
};

// The open word's control, directly under the sentence, with its help line
// beside it. Escape closes it.
export function WordEditor({ form }: { form: ChallengeFormState }) {
  const key = form.open;
  if (!key) return null;
  const errorKey = ERROR_OF[key];
  const error = errorKey ? form.errors[errorKey] : undefined;
  return (
    <div
      id={EDITOR_ID}
      role="group"
      aria-label={TITLE[key]}
      onKeyDown={(event) => {
        if (event.key === "Escape") form.closeWord();
      }}
      className="mt-2.5 grid grid-cols-1 gap-x-6 gap-y-3 md:grid-cols-[420px_1fr]"
    >
      <div className="min-w-0 space-y-1.5">
        <p className="font-label text-[0.8rem] tracking-[0.08em] text-dim-foreground">Editing: {TITLE[key]}</p>
        {key === "target" && <TargetEditor form={form} />}
        {key === "sources" && <SourceSearch form={form} />}
        {(key === "season-start" || key === "season-end") && (
          <DayEditor form={form} edge={key === "season-start" ? "start" : "end"} />
        )}
        {key === "schedule" && <ScheduleEditor form={form} />}
        {key === "ends-on" && <EndDateEditor form={form} />}
        {key in CALENDAR_FIELD && (
          <DayEditor form={form} field={CALENDAR_FIELD[key as keyof typeof CALENDAR_FIELD]} />
        )}
        {key === "slots-first" && <FirstYearEditor form={form} />}
        {key === "slots-last" && <LastYearEditor form={form} />}
        {key === "past-play" && <PastPlayEditor form={form} />}
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
      </div>
      <p className="text-[0.9rem] leading-[1.45] text-faint-foreground md:pt-6">{HELP[key]}</p>
    </div>
  );
}
