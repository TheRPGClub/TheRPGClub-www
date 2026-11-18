"use client";

import { clubToday } from "@/lib/challenges/dates";
import { lastFromRuler, rulerScale, slotsCountLine } from "@/lib/challenges/slots-form";
import type { ChallengeFormState } from "@/hooks/use-challenge-form";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";

// A Slots Challenge's years under its sentence (surface brief
// challenges-form, 5C): a ruler from 1970 (or the fixed first year's
// decade) to now, a tick every 2 years and a label every 10, with the range
// as a paper band between two handles, each labelled with its sentence word.
// Dragging a handle sets a fixed year and opens its word, whose handle turns
// yellow; the birth-year handle stands at an example member's year.
export function YearRuler({ form }: { form: ChallengeFormState }) {
  const thisYear = Number(clubToday().slice(0, 4));
  const { slots } = form.draft;
  const scale = rulerScale(slots, thisYear);
  const words = [
    slots.first === "birth_year" ? "Each member's birth year" : String(slots.first),
    slots.last === "current_year" ? "Current year" : String(slots.last),
  ];
  const active = form.open === "slots-first" ? 0 : form.open === "slots-last" ? 1 : null;
  // Handles close together stack their words on two lines.
  const close = scale.percent(scale.values[1]) - scale.percent(scale.values[0]) < 40;
  return (
    <div className="mt-3 rounded-md bg-card px-4 pt-[18px] pb-4 sm:px-[22px]">
      <div className="relative h-[78px]">
        {scale.ticks.map((tick) => (
          <span key={tick.year} aria-hidden>
            <i
              className={cn("absolute bottom-[22px] w-px bg-border-strong", tick.label ? "h-3.5" : "h-1.5")}
              style={{ left: `${scale.percent(tick.year)}%` }}
            />
            {tick.label && (
              <span
                className="font-label absolute bottom-0 -translate-x-1/2 text-[0.75rem] text-faint-foreground"
                style={{ left: `${scale.percent(tick.year)}%` }}
              >
                {tick.year}
              </span>
            )}
          </span>
        ))}
        {words.map((word, i) => (
          <span
            key={i}
            aria-hidden
            className={cn(
              "font-label absolute top-0 text-[0.72rem] font-extrabold tracking-[0.06em] whitespace-nowrap uppercase sm:text-[0.75rem]",
              active === i ? "text-highlight" : "text-foreground",
              i === 0 ? (scale.percent(scale.values[0]) < 20 ? "" : "-translate-x-1/2") : "-translate-x-full",
              i === 0 && close && "top-4",
            )}
            style={{ left: `${scale.percent(scale.values[i])}%` }}
          >
            {word}
          </span>
        ))}
        <Slider
          tone="year-ruler"
          min={scale.start}
          max={scale.end}
          step={1}
          value={scale.values}
          disabled={form.locked}
          getAriaLabel={(i) => (i === 0 ? "First year" : "Last year")}
          getAriaValueText={(_, value, i) =>
            (i === 0 && slots.first === "birth_year") || (i === 1 && slots.last === "current_year")
              ? words[i]
              : String(value)
          }
          onValueChange={(value, details) => {
            const [a, b] = value as number[];
            const i = details.activeThumbIndex;
            form.openWord(i === 0 ? "slots-first" : "slots-last");
            form.update({
              slots: i === 0 ? { ...slots, first: a } : { ...slots, last: lastFromRuler(b, thisYear) },
            });
          }}
          className="absolute inset-x-0 bottom-[14px]"
          trackClassName="data-horizontal:h-5"
          thumbClassName="h-9 w-1 after:-inset-x-5"
        />
      </div>
      <p className="mt-2 text-[0.85rem] text-faint-foreground">
        Drag a handle or tap its word. {slotsCountLine(slots, thisYear)}
        {slots.first === "birth_year" && " Members are told their birth year will show on their Run."}
      </p>
    </div>
  );
}
