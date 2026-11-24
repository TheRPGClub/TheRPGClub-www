"use client";

import { Plus } from "lucide-react";
import { formatFullDay, formatMonthDay } from "@/lib/challenges/dates";
import type { ChallengeFormState } from "@/hooks/use-challenge-form";
import { Button } from "@/components/ui/button";
import { RuleWord, SourceWord } from "@/components/challenges/form/rule-word";

export const EDITOR_ID = "challenge-rule-editor";

// The rules as one sentence (surface brief challenges-form, 5D) on an ink-2
// panel, big Barlow in the dim ink with each setting an underlined word:
// "Clear [3] games from [Final Fantasy ×] [+ Franchise or Series],
// played between [22 Sep] and [20 Dec], [every year]." "every year" and "any
// time" switch Seasonal and Always Open; "any time" adds "until [no end
// date]". The end date stays open once the rules are locked.
export function RuleSentence({ form }: { form: ChallengeFormState }) {
  const { draft, open, toggleWord, errors, locked } = form;
  const word = (key: Parameters<typeof toggleWord>[0]) => ({
    open: open === key,
    onToggle: () => toggleWord(key),
    controls: EDITOR_ID,
    locked,
  });
  const seasonal = draft.schedule === "seasonal";
  const target = draft.target === "all" ? "every game" : String(draft.target);
  return (
    <p className="rounded-md bg-card px-5 py-5 text-[1.5rem] leading-[1.6] font-medium text-dim-foreground sm:px-7 sm:py-6 sm:text-[2.375rem] sm:leading-[1.55]">
      Clear{" "}
      <RuleWord label="Games to Clear" invalid={!!errors.target} {...word("target")}>
        {target}
      </RuleWord>{" "}
      {draft.target === "all" ? "" : draft.target === 1 ? "game " : "games "}
      from{" "}
      {draft.sources.map((source) => (
        <SourceWord
          key={`${source.kind}-${source.id}`}
          name={source.name}
          {...word("sources")}
          onRemove={() => form.removeSource(source)}
        />
      ))}
      {!locked && (
        <Button
          type="button"
          variant="rule-add"
          size="inline"
          aria-expanded={open === "sources"}
          aria-controls={EDITOR_ID}
          aria-invalid={!!errors.sources || undefined}
          onClick={() => toggleWord("sources")}
          className="mx-0.5 inline-flex items-center gap-2 leading-[1.15] whitespace-nowrap [&_svg]:size-[0.55em]"
        >
          <Plus aria-hidden /> Franchise or Series
        </Button>
      )}
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
