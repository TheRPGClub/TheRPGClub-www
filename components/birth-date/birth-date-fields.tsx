"use client";

import { useId } from "react";
import { daysInMonth, MONTH_NAMES, type BirthDateParts } from "@/lib/birth-date-parts";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// The caption type of the desk's own fields ("Member").
const CAPTION = "font-label block text-[0.82rem] tracking-[0.08em]";

const MONTHS: Record<string, string> = Object.fromEntries(
  MONTH_NAMES.map((name, i) => [String(i + 1).padStart(2, "0"), name]),
);

// A Birth Date as Day and Month selects and an optional Year field (spec
// api#396; a browser date field can't leave the year out), each with its
// caption above it. Controlled: the parts and their parsing live in
// lib/birth-date-parts. Built for the staff desk (www#118), for /settings to
// share (www#117).
export function BirthDateFields({
  parts,
  onChange,
  disabled,
  invalid,
  describedBy,
}: {
  parts: BirthDateParts;
  onChange: (field: keyof BirthDateParts, value: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  describedBy?: string;
}) {
  const id = useId();
  const days = Object.fromEntries(
    Array.from({ length: daysInMonth(parts.month) }, (_, i) => [String(i + 1).padStart(2, "0"), String(i + 1)]),
  );
  const field = { "aria-describedby": describedBy, "aria-invalid": invalid || undefined };

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <Label variant="field" className={CAPTION} id={`${id}-day`}>
          Day
        </Label>
        <PartSelect
          items={days}
          value={parts.day}
          placeholder="Day"
          onChange={(v) => onChange("day", v)}
          disabled={disabled}
          labelledBy={`${id}-day`}
          className="w-[5.25rem]"
          {...field}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label variant="field" className={CAPTION} id={`${id}-month`}>
          Month
        </Label>
        <PartSelect
          items={MONTHS}
          value={parts.month}
          placeholder="Month"
          onChange={(v) => onChange("month", v)}
          disabled={disabled}
          labelledBy={`${id}-month`}
          className="w-[9.5rem]"
          {...field}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label variant="field" className={CAPTION} htmlFor={`${id}-year`}>
          Year
        </Label>
        <Input
          id={`${id}-year`}
          inputMode="numeric"
          autoComplete="bday-year"
          maxLength={4}
          placeholder="Year"
          value={parts.year}
          onChange={(e) => onChange("year", e.target.value.replace(/\D/g, ""))}
          disabled={disabled}
          className="w-24"
          {...field}
        />
      </div>
    </>
  );
}

function PartSelect({
  items,
  value,
  placeholder,
  onChange,
  disabled,
  labelledBy,
  className,
  ...aria
}: Pick<React.ComponentProps<"button">, "aria-describedby" | "aria-invalid" | "disabled"> & {
  items: Record<string, string>;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  labelledBy: string;
  className: string;
}) {
  // Wrapped: the Select's hidden input is a sibling of its trigger.
  return (
    <div>
      <Select
        items={items}
        value={value || null}
        onValueChange={(next) => onChange(next == null ? "" : String(next))}
        disabled={disabled}
      >
        <SelectTrigger aria-labelledby={labelledBy} {...aria} className={`${className} data-[size=default]:h-9`}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(items).map(([v, label]) => (
            <SelectItem key={v} value={v}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
