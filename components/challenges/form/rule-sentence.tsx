"use client";

import { formatFullDay, formatMonthDay } from "@/lib/challenges/dates";
import type { ChallengeFormState } from "@/hooks/use-challenge-form";
import { RuleWord } from "@/components/challenges/form/rule-word";

export const EDITOR_ID = "challenge-rule-editor";

// The rules as one sentence (surface brief challenges-form, 5D; pick 8A's
// sentence, www#170) on an ink-2 panel, big Barlow in the dim ink with each
// setting an underlined word: "Clear every Core Game and [2 Optional Games],
// played between [22 Sep] and [20 Dec], [every year]." The Pool's games and
// sources are set in the editor under it. "every year" and "any time" switch
// Seasonal and Always Open; "any time" adds "until [no end date]". The
// Optional target and the end date stay open once the rules are locked.
export function RuleSentence({ form }: { form: ChallengeFormState }) {
  const { draft, open, toggleWord, errors, locked } = form;
  const word = (key: Parameters<typeof toggleWord>[0]) => ({
    open: open === key,
    onToggle: () => toggleWord(key),
    controls: EDITOR_ID,
    locked,
  });
  const seasonal = draft.schedule === "seasonal";
  const target = draft.optionalTarget;
  return (
    <p className="rounded-md bg-card px-5 py-5 text-[1.5rem] leading-[1.6] font-medium text-dim-foreground sm:px-7 sm:py-6 sm:text-[2.375rem] sm:leading-[1.55]">
      Clear {draft.core.length > 0 && "every Core Game and "}
      <RuleWord label="Optional Games to Clear" invalid={!!errors.target} {...word("target")} locked={false}>
        {`${target} Optional ${target === 1 ? "Game" : "Games"}`}
      </RuleWord>
      {seasonal ? (
        <>
          , played between{" "}
          <RuleWord label="Season starts" icon="calendar" invalid={!!errors.season} {...word("season-start")}>
            {formatMonthDay(draft.seasonStart)}
          </RuleWord>{" "}
          and{" "}
          <RuleWord label="Season ends" icon="calendar" invalid={!!errors.season} {...word("season-end")}>
            {formatMonthDay(draft.seasonEnd)}
          </RuleWord>
          ,{" "}
          <RuleWord label="When" {...word("schedule")}>
            every year
          </RuleWord>
          .
        </>
      ) : (
        <>
          , played{" "}
          <RuleWord label="When" {...word("schedule")}>
            any time
          </RuleWord>{" "}
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
          .
        </>
      )}
    </p>
  );
}
