"use client";

import { useId } from "react";
import { MONTH_SHORT, type DateChoice, type DateDraft } from "@/lib/codex/codex-date";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { DrawerCard } from "./drawer-card";

const CHOICES: [DateChoice, string][] = [
  ["none", "No date"],
  ["year", "Year"],
  ["month", "Month"],
  ["day", "Day"],
];
// The parts each precision keeps.
const KEEPS: Record<DateChoice, { day: boolean; month: boolean; year: boolean }> = {
  none: { day: false, month: false, year: false },
  year: { day: false, month: false, year: true },
  month: { day: false, month: true, year: true },
  day: { day: true, month: true, year: true },
};
// A part the precision drops greys out under a 4px strike rather than
// going, so switching back restores it as it was.
function Part({ kept, children }: { kept: boolean; children: React.ReactNode }) {
  return (
    <span className={cn("relative inline-flex", !kept && "text-faint-foreground opacity-45")}>
      {children}
      {!kept && <span aria-hidden className="pointer-events-none absolute inset-x-0 top-[46%] z-10 h-1 bg-current" />}
    </span>
  );
}

// The Date card (5D): the date set big in Anton, each part editable in place,
// over No date | Year | Month | Day. A History Event's date is required
// (www#126): its card loses No date.
export function DateCard({
  desk,
  tilt,
  required = false,
}: {
  desk: { date: DateDraft; setDate: (date: DateDraft) => void };
  tilt: number;
  required?: boolean;
}) {
  const id = useId();
  const { date, setDate } = desk;
  const choices = required ? CHOICES.filter(([value]) => value !== "none") : CHOICES;
  const keeps = KEEPS[date.choice];
  const months = MONTH_SHORT.map((label, i) => ({ value: String(i + 1), label }));
  return (
    <DrawerCard title="Date" note={required ? "Required" : "Optional"} tilt={tilt}>
      <div
        className="font-headline flex items-baseline gap-x-2.5 text-[2.875rem] leading-[1] uppercase"
        aria-describedby={`${id}-help`}
      >
        <Part kept={keeps.day}>
          <Input
            variant="readout"
            inputMode="numeric"
            aria-label="Day"
            value={date.day}
            maxLength={2}
            disabled={!keeps.day}
            onChange={(e) => setDate({ ...date, day: e.currentTarget.value.replace(/\D/g, "") })}
            className="font-headline h-auto w-auto min-w-[1ch] border-0 p-0 [field-sizing:content] text-[length:inherit] leading-[1] md:text-[length:inherit]"
          />
        </Part>
        <Part kept={keeps.month}>
          <Select
            items={months}
            value={String(date.month)}
            disabled={!keeps.month}
            onValueChange={(value) => value && setDate({ ...date, month: Number(value) })}
          >
            <SelectTrigger variant="bare" aria-label="Month" className="uppercase">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Part>
        <Part kept={keeps.year}>
          <Input
            variant="readout"
            inputMode="numeric"
            aria-label="Year"
            value={date.year}
            maxLength={4}
            disabled={!keeps.year}
            onChange={(e) => setDate({ ...date, year: e.currentTarget.value.replace(/\D/g, "") })}
            className="font-headline h-auto w-auto min-w-[2ch] border-0 p-0 [field-sizing:content] text-[length:inherit] leading-[1] md:text-[length:inherit]"
          />
        </Part>
      </div>
      <ToggleGroup
        variant="switcher"
        aria-label="How precise the date is"
        value={[date.choice]}
        onValueChange={(value: string[]) => value[0] && setDate({ ...date, choice: value[0] as DateChoice })}
        className={cn("mt-3.5 grid w-full", required ? "grid-cols-3" : "grid-cols-4")}
      >
        {choices.map(([value, label]) => (
          <ToggleGroupItem key={value} value={value} variant="switcher" size="sm" className="w-full">
            {label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <p id={`${id}-help`} className="mt-2.5 text-[0.85rem] text-faint-foreground">
        Pick Month or Year when nobody remembers the day.
      </p>
    </DrawerCard>
  );
}
