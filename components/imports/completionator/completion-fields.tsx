"use client";

import { useId } from "react";
import type { CompletionatorForm } from "@/lib/api/types";
import {
  COMPLETION_TYPES,
  datePart,
  formatImportDate,
  todayDate,
  type AddCompletionForm,
  type DateChoice,
} from "@/lib/imports/completionator";
import { FIELD_LABEL, FieldSelect } from "@/components/imports/completionator/field-select";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

// The platform Select's "no platform" option; the form keeps it as "".
const OTHER_PLATFORM = "other";

// The completion's fields: type, platform, the date it was finished (from
// the file, today, unknown or picked) and the playtime.
export function CompletionFields({
  values,
  onChange,
  form,
  rowDate,
}: {
  values: AddCompletionForm;
  onChange: (patch: Partial<AddCompletionForm>) => void;
  // The API's prefill: the game's platforms and whether one makes a release.
  form: CompletionatorForm | null;
  // The row's own date, offered as a choice when it has one.
  rowDate: string | null;
}) {
  const dateLegend = useId();
  const createsRelease =
    !!form?.creates_release && !!form.platform_id && values.platformId === String(form.platform_id);
  const fromFile: [DateChoice, string][] =
    datePart(rowDate) !== null ? [["csv", `From the file (${formatImportDate(rowDate)})`]] : [];
  const dateOptions: [DateChoice, string][] = [
    ...fromFile,
    ["today", "Today"],
    ["unknown", "I don't know"],
    ["custom", "Pick a date"],
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FieldSelect
        label="Completion type"
        items={COMPLETION_TYPES.map((type) => ({ value: type, label: type }))}
        value={values.completionType}
        onChange={(completionType) => onChange({ completionType })}
      />

      <FieldSelect
        label="Platform"
        items={[
          { value: OTHER_PLATFORM, label: "Other / not listed" },
          ...(form?.platforms ?? []).map((p) => ({ value: String(p.platform_id), label: p.platform_name })),
        ]}
        value={values.platformId || OTHER_PLATFORM}
        onChange={(id) => onChange({ platformId: id === OTHER_PLATFORM ? "" : id })}
      >
        {createsRelease && (
          <span className="block text-xs text-faint-foreground">
            This platform isn&apos;t listed for the game yet; adding it records a release.
          </span>
        )}
      </FieldSelect>

      <fieldset className="space-y-1.5 text-sm sm:col-span-2">
        <legend id={dateLegend} className={FIELD_LABEL}>Date finished</legend>
        <RadioGroup
          aria-labelledby={dateLegend}
          value={values.dateChoice}
          onValueChange={(dateChoice) => onChange({ dateChoice: dateChoice as DateChoice })}
          className="flex flex-wrap gap-x-4 gap-y-1.5 pt-1"
        >
          {dateOptions.map(([value, label]) => (
            <Label key={value} variant="frame" className="inline-flex items-center gap-1.5">
              <RadioGroupItem value={value} />
              {label}
            </Label>
          ))}
        </RadioGroup>
        {values.dateChoice === "custom" && (
          <Input
            type="date"
            value={values.customDate}
            max={todayDate()}
            onChange={(e) => onChange({ customDate: e.target.value })}
            aria-label="Date finished"
            className="mt-1 w-auto"
          />
        )}
      </fieldset>

      <Label variant="frame" className="space-y-1.5 text-sm">
        <span className={FIELD_LABEL}>Playtime (hours)</span>
        <Input
          type="number"
          min={0}
          step="0.01"
          inputMode="decimal"
          value={values.playtime}
          onChange={(e) => onChange({ playtime: e.target.value })}
          placeholder="Unknown"
        />
      </Label>
    </div>
  );
}
