"use client";

import type { ChallengeFormState } from "@/hooks/use-challenge-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

// The controls an open rule word shows beneath the sentence (the Season's
// days are in ./day-editor).

export function TargetEditor({ form }: { form: ChallengeFormState }) {
  const { draft, update, preview } = form;
  const every = draft.target === "all";
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        type="number"
        variant="compose"
        min={1}
        max={preview.known ? preview.size : undefined}
        inputMode="numeric"
        aria-label="Games to Clear"
        autoFocus
        value={every ? "" : String(draft.target)}
        placeholder="3"
        onChange={(e) =>
          update({
            target: e.target.value === "" ? 0 : Math.trunc(Number(e.target.value)),
          })
        }
        className="w-28"
      />
      <Button
        type="button"
        variant={every ? "selected" : "outline"}
        aria-pressed={every}
        onClick={() => update({ target: every ? 3 : "all" })}
      >
        Every game{preview.known ? ` (${preview.size})` : ""}
      </Button>
    </div>
  );
}

export function ScheduleEditor({ form }: { form: ChallengeFormState }) {
  return (
    <ToggleGroup
      variant="outline"
      spacing={0}
      value={[form.draft.schedule]}
      onValueChange={(value) => {
        const next = value[0];
        if (next === "seasonal" || next === "always_open") form.update({ schedule: next });
      }}
      aria-label="When it's open"
    >
      <ToggleGroupItem value="seasonal" className="px-3.5">
        Every year (Seasonal)
      </ToggleGroupItem>
      <ToggleGroupItem value="always_open" className="px-3.5">
        Any time (Always Open)
      </ToggleGroupItem>
    </ToggleGroup>
  );
}

export function EndDateEditor({ form }: { form: ChallengeFormState }) {
  const { draft, update } = form;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        type="date"
        variant="compose"
        aria-label="Last Open day"
        autoFocus
        value={draft.endsOn ?? ""}
        onChange={(e) => update({ endsOn: e.target.value || null })}
        className="w-48 [color-scheme:dark]"
      />
      <Button
        type="button"
        variant={draft.endsOn ? "outline" : "selected"}
        aria-pressed={!draft.endsOn}
        onClick={() => update({ endsOn: null })}
      >
        No end date
      </Button>
    </div>
  );
}
