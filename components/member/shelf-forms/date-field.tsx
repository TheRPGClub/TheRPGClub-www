"use client";

import { useId, useState } from "react";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { dateOfDay, dayBlock, dayOfDate, longDay, type IsoDay } from "@/lib/shelf-forms/dates";

export interface DateFieldProps {
  label: string;
  value: IsoDay | null;
  onChange: (value: IsoDay | null) => void;
  // The club's today: the Today shortcut and the red bar in the grid.
  today: IsoDay;
  // The first and last days that can be picked.
  min?: IsoDay | null;
  max?: IsoDay | null;
  // An optional day can be cleared.
  optional?: boolean;
  // "block": the paper slip's big date block. "field": a plain date field.
  variant?: "block" | "field";
  // A line under the block's day ("From Now Playing", "Today").
  sub?: React.ReactNode;
  // A line in the calendar above the grid ("You started playing on 9 Nov").
  say?: React.ReactNode;
  // The other end of a span (Finished for Started): washed between, ringed.
  other?: IsoDay | null;
  placeholder?: string;
  error?: string;
}

// A day picked on a calendar in a popover (spec api#451): day precision,
// with a Today shortcut and, when the day is optional, Clear. Days outside
// min..max can't be picked.
export function DateField(props: DateFieldProps) {
  const { label, value, onChange, today, min, max, optional, variant = "field", other, error } = props;
  const [open, setOpen] = useState(false);
  const errorId = useId();
  const pick = (day: IsoDay | null) => {
    onChange(day);
    setOpen(false);
  };
  const todayAllowed = (!min || today >= min) && (!max || today <= max);
  const ends = [value, other].filter((d): d is IsoDay => !!d).sort();
  const between = ends.length === 2 && ends[0] !== ends[1] ? { after: dateOfDay(ends[0]), before: dateOfDay(ends[1]) } : undefined;

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          variant={variant === "block" ? "date-block" : "field"}
          aria-label={`${label}: ${value ? longDay(value) : "no day"}`}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={variant === "field" ? "h-9 w-full" : undefined}
        >
          {variant === "block" ? <DateBlockFace {...props} /> : <DateFieldFace value={value} today={today} placeholder={props.placeholder} />}
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[19.5rem] gap-2 p-3">
          <Calendar
            mode="single"
            heading={label}
            selected={value ? dateOfDay(value) : undefined}
            defaultMonth={dateOfDay(value ?? other ?? today)}
            onSelect={(date) => date && pick(dayOfDate(date))}
            today={dateOfDay(today)}
            disabled={[...(min ? [{ before: dateOfDay(min) }] : []), ...(max ? [{ after: dateOfDay(max) }] : [])]}
            endMonth={max ? dateOfDay(max) : undefined}
            modifiers={{ span: between ?? false, anchor: other ? dateOfDay(other) : false }}
          />
          {props.say && <p className="flex items-center gap-1.5 text-[0.84rem] text-dim-foreground">{props.say}</p>}
          <div className="flex items-center gap-3 border-t border-border pt-2">
            {todayAllowed && (
              <Button type="button" variant="quiet-link" size="inline" onClick={() => pick(today)}>
                Today
              </Button>
            )}
            {optional && value && (
              <Button type="button" variant="quiet-link" size="inline" className="ml-auto" onClick={() => pick(null)}>
                Clear
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>
      {error && (
        <p id={errorId} role="alert" className="self-start rounded-xs bg-destructive px-1.5 py-0.5 text-[0.8rem] font-semibold text-destructive-foreground">
          {error}
        </p>
      )}
    </div>
  );
}

function DateFieldFace({ value, today, placeholder }: { value: IsoDay | null; today: IsoDay; placeholder?: string }) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      <CalendarDays aria-hidden className="size-4 opacity-70" />
      <span className="truncate">
        {value ? `${value === today ? "Today · " : ""}${longDay(value)}` : (placeholder ?? "Pick a day")}
      </span>
    </span>
  );
}

function DateBlockFace({ label, value, sub, optional, placeholder }: DateFieldProps) {
  const block = value ? dayBlock(value) : null;
  return (
    <>
      <span className="font-label flex items-center gap-1.5 text-[0.72rem] leading-none font-extrabold tracking-[0.08em] uppercase opacity-70">
        <CalendarDays aria-hidden className="size-3.5" />
        {label}
        {optional && <span className="font-semibold tracking-[0.04em] normal-case">optional</span>}
      </span>
      <span className="mt-1.5 flex items-end gap-1.5">
        <span className={`font-headline text-[2.6rem] leading-[0.8] sm:text-5xl ${block ? "" : "opacity-35"}`}>
          {block?.day ?? "--"}
        </span>
        <span className="font-headline pb-px text-[1.05rem] leading-none uppercase">
          {block?.monthYear ?? (placeholder ?? "Pick a day")}
        </span>
      </span>
      <span className="font-label mt-1.5 flex min-h-3.5 items-center gap-1 text-[0.7rem] leading-tight font-bold tracking-[0.07em] uppercase opacity-65">
        {sub}
      </span>
    </>
  );
}
