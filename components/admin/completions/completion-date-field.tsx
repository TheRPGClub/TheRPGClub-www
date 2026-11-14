"use client";

import { todayDate } from "@/lib/imports/completionator";
import type { DateChoice } from "@/hooks/use-completion-form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const DATE_CHOICES: readonly [DateChoice, string][] = [
  ["today", "Today"],
  ["unknown", "No date"],
  ["custom", "Pick a date"],
];

// When the member finished: today, no date, or a date picked (not after
// today).
export function CompletionDateField({
  label,
  choice,
  onChoiceChange,
  date,
  onDateChange,
  disabled,
}: {
  label: string;
  choice: DateChoice;
  onChoiceChange: (choice: DateChoice) => void;
  date: string;
  onDateChange: (date: string) => void;
  disabled: boolean;
}) {
  return (
    <fieldset className="space-y-1.5">
      <legend className={label}>Completed</legend>
      <RadioGroup
        value={choice}
        onValueChange={(value) => onChoiceChange(value as DateChoice)}
        disabled={disabled}
        aria-label="Completed"
        className="flex w-auto flex-wrap gap-x-4 gap-y-1.5 pt-1.5 text-sm"
      >
        {DATE_CHOICES.map(([value, text]) => (
          <label key={value} className="inline-flex items-center gap-1.5">
            <RadioGroupItem value={value} />
            {text}
          </label>
        ))}
      </RadioGroup>
      {choice === "custom" && (
        <Input
          type="date"
          value={date}
          max={todayDate()}
          onChange={(e) => onDateChange(e.target.value)}
          aria-label="Date completed"
          disabled={disabled}
          className="mt-1.5 w-auto"
        />
      )}
    </fieldset>
  );
}
