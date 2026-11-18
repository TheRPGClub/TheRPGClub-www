"use client";

import { useId } from "react";
import { MONTHS, type BirthDateFields as Fields } from "@/lib/birth-date";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const DAY_ITEMS: Record<string, string> = Object.fromEntries(
  Array.from({ length: 31 }, (_, i) => [String(i + 1), String(i + 1)]),
);
// The field captions in the label voice, as the /settings mock sets them.
const CAPTION = "font-label text-[0.82rem] font-bold tracking-[0.08em]";
const MONTH_ITEMS: Record<string, string> = Object.fromEntries(MONTHS.map((name, i) => [String(i + 1), name]));

// A Birth Date as Day and Month selects and an optional four-digit Year,
// each captioned above (pick A): a browser date field can't leave the year
// out. Controlled; parsing lives in lib/birth-date, and Save checks the day
// fits the month. Shared by /settings and the staff desk (own captions).
export function BirthDateFields({
  fields,
  onChange,
  disabled,
  describedBy,
  invalid,
  captionClassName = CAPTION,
}: {
  fields: Fields;
  onChange: (field: keyof Fields, value: string) => void;
  disabled: boolean;
  describedBy?: string;
  invalid: boolean;
  captionClassName?: string;
}) {
  const id = useId();
  const shared = { disabled, describedBy, invalid, captionClassName };
  return (
    <>
      <PickField
        id={`${id}-day`}
        label="Day"
        items={DAY_ITEMS}
        value={fields.day}
        onChange={(v) => onChange("day", v)}
        {...shared}
        width="w-21"
      />
      <PickField
        id={`${id}-month`}
        label="Month"
        items={MONTH_ITEMS}
        value={fields.month}
        onChange={(v) => onChange("month", v)}
        {...shared}
        width="w-37.5"
      />
      <div className="flex flex-col gap-2">
        <Label variant="field" htmlFor={`${id}-year`} className={captionClassName}>
          Year
        </Label>
        <Input
          id={`${id}-year`}
          inputMode="numeric"
          autoComplete="bday-year"
          maxLength={4}
          placeholder="Year"
          value={fields.year}
          onChange={(e) => onChange("year", e.target.value)}
          disabled={disabled}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          className="w-24"
        />
      </div>
    </>
  );
}

type Shared = { disabled: boolean; describedBy?: string; invalid: boolean; captionClassName: string };

function PickField({
  id,
  label,
  items,
  value,
  onChange,
  disabled,
  describedBy,
  invalid,
  captionClassName,
  width,
}: Shared & {
  id: string;
  label: string;
  items: Record<string, string>;
  value: string;
  onChange: (value: string) => void;
  width: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label variant="field" id={`${id}-label`} className={captionClassName}>
        {label}
      </Label>
      <Select
        items={items}
        value={value === "" ? null : value}
        onValueChange={(v) => onChange(v == null ? "" : String(v))}
        disabled={disabled}
      >
        <SelectTrigger
          aria-labelledby={`${id}-label`}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          className={`${width} data-[size=default]:h-9`}
        >
          <SelectValue placeholder={label} />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(items).map(([v, name]) => (
            <SelectItem key={v} value={v}>
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
