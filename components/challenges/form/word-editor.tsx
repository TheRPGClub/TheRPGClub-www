"use client";

import type { ChallengeFormState, RuleWordKey } from "@/hooks/use-challenge-form";
import { EDITOR_ID } from "@/components/challenges/form/rule-sentence";
import { SourceSearch } from "@/components/challenges/form/source-search";
import { DayEditor } from "@/components/challenges/form/day-editor";
import { EndDateEditor, ScheduleEditor, TargetEditor } from "@/components/challenges/form/word-controls";

const TITLE: Record<RuleWordKey, string> = {
  target: "Games to Clear",
  sources: "Built from",
  "season-start": "Season starts",
  "season-end": "Season ends",
  schedule: "When it's open",
  "ends-on": "Last Open day",
};

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
};

const ERROR_OF: Partial<Record<RuleWordKey, keyof ChallengeFormState["errors"]>> = {
  target: "target",
  sources: "sources",
  "season-start": "season",
  "season-end": "season",
  "ends-on": "endsOn",
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
