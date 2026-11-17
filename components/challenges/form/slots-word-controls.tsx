"use client";

import type { ChallengeFormState } from "@/hooks/use-challenge-form";
import { clubToday } from "@/lib/challenges/dates";
import { FIRST_ALLOWED, LAST_ALLOWED, type SlotsDraft } from "@/lib/challenges/slots-form";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

// The Slots words' controls beneath the sentence (www#109): each end of the
// range as a choice (each member's birth year or the current year, or a
// fixed year typed in), and Counts past play on or off.

function YearEnd({
  form,
  end,
  moving,
  movingLabel,
  fallback,
}: {
  form: ChallengeFormState;
  end: "first" | "last";
  // The end that moves with the member or the calendar.
  moving: "birth_year" | "current_year";
  movingLabel: string;
  // The year a switch to a fixed year starts at.
  fallback: number;
}) {
  const value = form.draft.slots[end];
  const fixed = typeof value === "number";
  const set = (next: SlotsDraft["first"] | SlotsDraft["last"]) =>
    form.update({ slots: { ...form.draft.slots, [end]: next } });
  const label = end === "first" ? "First year" : "Last year";
  return (
    <div className="flex flex-wrap items-center gap-2">
      <ToggleGroup
        variant="outline"
        spacing={0}
        value={[fixed ? "fixed" : moving]}
        onValueChange={(v) => {
          if (v[0] === moving) set(moving);
          else if (v[0] === "fixed" && !fixed) set(fallback);
        }}
        aria-label={label}
      >
        <ToggleGroupItem value={moving} className="px-3.5">
          {movingLabel}
        </ToggleGroupItem>
        <ToggleGroupItem value="fixed" className="px-3.5">
          A fixed year
        </ToggleGroupItem>
      </ToggleGroup>
      {fixed && (
        <Input
          type="number"
          variant="compose"
          min={FIRST_ALLOWED}
          max={LAST_ALLOWED}
          inputMode="numeric"
          aria-label={label}
          autoFocus
          value={String(value)}
          onChange={(e) => set(e.target.value === "" ? 0 : Math.trunc(Number(e.target.value)))}
          className="w-28"
        />
      )}
    </div>
  );
}

export function FirstYearEditor({ form }: { form: ChallengeFormState }) {
  const last = form.draft.slots.last;
  return (
    <YearEnd
      form={form}
      end="first"
      moving="birth_year"
      movingLabel="Each member's birth year"
      fallback={typeof last === "number" ? last - 9 : 1990}
    />
  );
}

export function LastYearEditor({ form }: { form: ChallengeFormState }) {
  const first = form.draft.slots.first;
  const thisYear = Number(clubToday().slice(0, 4));
  return (
    <YearEnd
      form={form}
      end="last"
      moving="current_year"
      movingLabel="The current year"
      fallback={typeof first === "number" ? Math.min(first + 9, thisYear) : thisYear}
    />
  );
}

export function PastPlayEditor({ form }: { form: ChallengeFormState }) {
  const on = form.draft.slots.countsPastPlay;
  return (
    <ToggleGroup
      variant="outline"
      spacing={0}
      value={[on ? "on" : "off"]}
      onValueChange={(v) => {
        if (v[0]) form.update({ slots: { ...form.draft.slots, countsPastPlay: v[0] === "on" } });
      }}
      aria-label="Counts past play"
    >
      <ToggleGroupItem value="on" className="px-3.5">
        Counting past play
      </ToggleGroupItem>
      <ToggleGroupItem value="off" className="px-3.5">
        Not counting it
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
