"use client";

import { FORMAT_NAME } from "@/lib/challenges/board";
import type { ChallengeFormat } from "@/lib/challenges/types";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FormatSquare } from "@/components/challenges/format-mark";

// The Format, picked from three cards (surface brief challenges-form): each
// its name in Anton beside its ink square and one line on what it is; the
// chosen card carries the yellow ring. Assignment is for staff. Assignment
// settings come to the website with www#110; until then it is set up from
// Discord.

const LINE: Record<ChallengeFormat, string> = {
  slots: "One game for every year in a range",
  pool: "Clear games from a set you choose",
  assignment: "Members pick for each other (staff only)",
};

// The Formats this form can set up so far.
const ON_THE_WEBSITE: readonly ChallengeFormat[] = ["pool", "slots", "assignment"];

export function FormatCards({
  value,
  onChange,
  staff,
  locked,
}: {
  value: ChallengeFormat;
  onChange: (format: ChallengeFormat) => void;
  staff: boolean;
  locked: boolean;
}) {
  const formats: ChallengeFormat[] = staff ? ["slots", "pool", "assignment"] : ["slots", "pool"];
  return (
    <RadioGroup
      value={value}
      onValueChange={(next) => onChange(next as ChallengeFormat)}
      aria-label="Format"
      className={staff ? "grid-cols-1 gap-2.5 md:grid-cols-3" : "grid-cols-1 gap-2.5 md:grid-cols-2"}
    >
      {formats.map((format) => {
        const available = ON_THE_WEBSITE.includes(format) || format === value;
        return (
          <Label
            key={format}
            variant="choice"
            className="relative flex cursor-pointer flex-col items-start px-4 py-3.5 has-data-disabled:cursor-default has-data-disabled:opacity-60"
          >
            <RadioGroupItem value={format} variant="choice" disabled={locked || !available} className="sr-only" />
            <span className="font-headline flex items-center gap-2 text-[1.375rem] leading-none">
              <FormatSquare format={format} className="size-[11px]" />
              {FORMAT_NAME[format]}
            </span>
            <span className="mt-1.5 text-[0.94rem] leading-[1.35] text-dim-foreground">
              {available ? LINE[format] : `${LINE[format]}. Set one up from Discord for now.`}
            </span>
          </Label>
        );
      })}
    </RadioGroup>
  );
}
