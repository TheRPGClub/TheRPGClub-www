"use client";

import { Lock } from "lucide-react";
import { formatMonthDay } from "@/lib/challenges/dates";
import { BACKLOG_MINIMUM, calendarPreview } from "@/lib/challenges/edition-calendar";
import type { ChallengeFormState, RuleWordKey } from "@/hooks/use-challenge-form";
import { DecemberStrip } from "@/components/challenges/assignment/december-strip";
import { RuleWord } from "@/components/challenges/form/rule-word";
import { EDITOR_ID } from "@/components/challenges/form/rule-sentence";
import { WordEditor } from "@/components/challenges/form/word-editor";

// The Assignment (Secret Santa) Format's rules on the form (surface brief
// challenges-form): the sentence "Members sign up until [1 Dec], pick by
// [15 Dec] and see their game on [25 Dec]. They have until the next 25 Dec
// to Clear it.", each date a word whose day opens beneath it, then the
// December preview with the key days in holly and the fixed backlog rule.
// The year to Clear always runs to the next reveal, so it isn't a word.
export function AssignmentRules({ form, runCount }: { form: ChallengeFormState; runCount: number }) {
  const { draft, open, toggleWord, errors, locked } = form;
  const word = (key: RuleWordKey) => ({
    open: open === key,
    onToggle: () => toggleWord(key),
    controls: EDITOR_ID,
    locked,
    icon: "calendar" as const,
    invalid: !!errors.calendar,
  });
  const preview = calendarPreview(
    { cutoff: draft.signupCutoff, deadline: draft.pickDeadline, reveal: draft.reveal },
    new Date().getFullYear(),
  );
  return (
    <div data-slot="challenge-desk-body">
      <p className="rounded-md bg-card px-5 py-5 text-[1.5rem] leading-[1.6] font-medium text-dim-foreground sm:px-7 sm:py-6 sm:text-[2.375rem] sm:leading-[1.55]">
        Members sign up until{" "}
        <RuleWord label="Sign-up cutoff" {...word("signup-cutoff")}>
          {formatMonthDay(draft.signupCutoff)}
        </RuleWord>
        , pick by{" "}
        <RuleWord label="Pick deadline" {...word("pick-deadline")}>
          {formatMonthDay(draft.pickDeadline)}
        </RuleWord>{" "}
        and see their game on{" "}
        <RuleWord label="Reveal" {...word("reveal")}>
          {formatMonthDay(draft.reveal)}
        </RuleWord>
        . They have until{" "}
        the next {formatMonthDay(draft.reveal)}{" "}
        to Clear it.
      </p>
      <WordEditor form={form} />
      {locked && (
        <p className="mt-3 flex items-center gap-2.5 rounded-sm border border-dashed border-border-strong px-3.5 py-3 text-[0.92rem] text-dim-foreground">
          <Lock aria-hidden className="size-4 shrink-0" />
          {runCount > 0
            ? `The calendar is locked because ${runCount} ${runCount === 1 ? "Run has" : "Runs have"} started. The name and description can still change.`
            : "The calendar is locked. The name and description can still change."}
        </p>
      )}
      <section aria-label={preview.title} className="mt-4 rounded-md bg-card px-5 pt-4 pb-3 sm:px-7">
        <p className="font-label mb-3 text-[0.8rem] tracking-[0.08em] text-faint-foreground">{preview.title}</p>
        <DecemberStrip tiles={preview.tiles} label={preview.title} wrap />
        <p className="text-[0.9rem] leading-[1.45] text-faint-foreground">
          Members need at least {BACKLOG_MINIMUM} games in their backlog to sign up and at the draw. A missed pick
          becomes a random game on the deadline.
        </p>
      </section>
    </div>
  );
}
