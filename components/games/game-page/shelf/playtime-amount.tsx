"use client";

import { useId, useState } from "react";
import { Loader2 } from "lucide-react";
import type { ManualPlaytimeMode } from "@/lib/playtime/types";
import { changePreview, parseHours } from "@/lib/playtime/view";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

export const MODE_LABEL: Record<ManualPlaytimeMode, string> = { add: "Add time", set: "Set total" };

// Hours for one figure (2D+F): Add time or Set total, the hours, the change
// it makes ("30 h to 33 h") and its save. A Playthrough's total has no Add
// (`modes` off). `inline` sits under a source row, ringed in yellow while
// open; otherwise it is the quick Add Playtime's labelled block.
export function PlaytimeAmount({
  current,
  initialMode = "add",
  modes = true,
  inline,
  pending,
  saveLabel,
  onSave,
  onCancel,
  footnote,
}: {
  // The figure's minutes now, for the change line.
  current: number;
  initialMode?: ManualPlaytimeMode;
  modes?: boolean;
  inline?: boolean;
  pending: boolean;
  // "Save", or the quick add's "Add 3 h".
  saveLabel: (mode: ManualPlaytimeMode, typed: string) => string;
  onSave: (mode: ManualPlaytimeMode, minutes: number) => void;
  onCancel?: () => void;
  // A quiet line between the hours and the buttons.
  footnote?: string;
}) {
  const id = useId();
  const [mode, setMode] = useState<ManualPlaytimeMode>(modes ? initialMode : "set");
  const [typed, setTyped] = useState("");
  const minutes = parseHours(typed);
  const preview = changePreview(current, mode, typed);
  const invalid = typed.trim() !== "" && minutes == null;

  return (
    <form
      className={cn("flex flex-wrap items-center gap-2", inline && "mt-1.5 rounded-[3px] bg-muted px-3 py-2.5 inset-ring-1 inset-ring-highlight")}
      onSubmit={(event) => {
        event.preventDefault();
        if (minutes != null) onSave(mode, minutes);
      }}
    >
      {modes && (
        <ToggleGroup variant="outline" size="sm" spacing={0} aria-label="Add or set" value={[mode]} onValueChange={(v) => v[0] && setMode(v[0] as ManualPlaytimeMode)}>
          <ToggleGroupItem value="add">{inline ? MODE_LABEL.add : "Add"}</ToggleGroupItem>
          <ToggleGroupItem value="set">{MODE_LABEL.set}</ToggleGroupItem>
        </ToggleGroup>
      )}
      <label htmlFor={id} className="sr-only">
        Hours
      </label>
      <Input
        id={id}
        autoFocus
        inputMode="decimal"
        placeholder={mode === "add" ? "+ h" : "h"}
        value={typed}
        aria-invalid={invalid || undefined}
        onChange={(event) => setTyped(event.target.value)}
        className="h-8 w-21"
      />
      <span className={cn("text-[0.84rem]", invalid ? "text-destructive" : "text-faint-foreground")} aria-live="polite">
        {invalid ? "Hours must be a number, 0 or more." : (preview ?? "hours")}
      </span>
      {footnote && <p className="mt-1 w-full text-[0.8rem] text-faint-foreground">{footnote}</p>}
      <span className={cn("flex gap-1.5", inline ? "ml-auto" : "w-full justify-end pt-2")}>
        {onCancel && (
          <Button type="button" variant="ghost" size={inline ? "xs" : "sm"} onClick={onCancel} disabled={pending}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="highlight" size={inline ? "xs" : "sm"} disabled={pending || minutes == null}>
          {pending && <Loader2 aria-hidden className="motion-safe:animate-spin" />}
          {saveLabel(mode, typed)}
        </Button>
      </span>
    </form>
  );
}
