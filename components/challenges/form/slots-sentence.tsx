"use client";

import { formatFullDay, formatMonthDay } from "@/lib/challenges/dates";
import type { ChallengeFormState, RuleWordKey } from "@/hooks/use-challenge-form";
import { EDITOR_ID } from "@/components/challenges/form/rule-sentence";
import { RuleWord } from "@/components/challenges/form/rule-word";

// A Slots Challenge's rules as one sentence (surface brief challenges-form,
// 5D): "One game from every year, from [each member's birth year | 1990] to
// [the current year | 1999], open [any time | every year], [counting past
// play | not counting past play]." Counting past play is offered only while
// it's open any time, which also takes an optional end date; every year
// takes the Season's days.
export function SlotsSentence({ form }: { form: ChallengeFormState }) {
  const { draft, open, toggleWord, errors, locked } = form;
  const word = (key: RuleWordKey) => ({
    open: open === key,
    onToggle: () => toggleWord(key),
    controls: EDITOR_ID,
    locked,
  });
  const { first, last, countsPastPlay } = draft.slots;
  const seasonal = draft.schedule === "seasonal";
  return (
    <p className="rounded-md bg-card px-5 py-5 text-[1.5rem] leading-[1.6] font-medium text-dim-foreground sm:px-7 sm:py-6 sm:text-[2.375rem] sm:leading-[1.55]">
      One game from every year, from{" "}
      <RuleWord label="First year" invalid={!!errors.slotsFirst} {...word("slots-first")}>
        {first === "birth_year" ? "each member's birth year" : String(first)}
      </RuleWord>{" "}
      to{" "}
      <RuleWord label="Last year" invalid={!!errors.slotsLast} {...word("slots-last")}>
        {last === "current_year" ? "the current year" : String(last)}
      </RuleWord>
      , open{" "}
      <RuleWord label="When" {...word("schedule")}>
        {seasonal ? "every year" : "any time"}
      </RuleWord>
      {seasonal ? (
        <>
          {" "}
          between{" "}
          <RuleWord label="Season starts" icon="calendar" invalid={!!errors.season} {...word("season-start")}>
            {formatMonthDay(draft.seasonStart)}
          </RuleWord>{" "}
          and{" "}
          <RuleWord label="Season ends" icon="calendar" invalid={!!errors.season} {...word("season-end")}>
            {formatMonthDay(draft.seasonEnd)}
          </RuleWord>
          .
        </>
      ) : (
        <>
          {" "}
          until{" "}
          <RuleWord
            label="Last Open day"
            icon="calendar"
            invalid={!!errors.endsOn}
            {...word("ends-on")}
            locked={form.endDateLocked}
          >
            {draft.endsOn ? formatFullDay(draft.endsOn) : "no end date"}
          </RuleWord>
          ,{" "}
          <RuleWord label="Counts past play" {...word("past-play")}>
            {countsPastPlay ? "counting past play" : "not counting past play"}
          </RuleWord>
          .
        </>
      )}
    </p>
  );
}
