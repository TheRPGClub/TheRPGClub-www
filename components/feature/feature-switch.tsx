"use client";

import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

// The settings on/off switch: a hard-cornered track that fills highlighter
// yellow when on (the member's own choice), with the state also spelled out in
// label type beside it, so it never rests on colour alone. The label and the
// track are one control (the label passes its clicks, hover and focus ring to
// the switch). An unavailable switch keeps its position but dims and does
// nothing; the row says why (see `describedBy`).
export function FeatureSwitch({
  checked,
  onChange,
  pending = false,
  unavailable = false,
  onLabel,
  offLabel,
  labelledBy,
  describedBy,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  pending?: boolean;
  unavailable?: boolean;
  onLabel: string;
  offLabel: string;
  // ids of the row's name and its "where it shows up" line
  labelledBy: string;
  describedBy?: string;
}) {
  return (
    <label
      className={cn(
        "-my-2 -mr-2 flex shrink-0 items-center gap-3 rounded-sm py-2 pr-2 pl-3 has-focus-visible:ring-3 has-focus-visible:ring-ring/50",
        unavailable ? "cursor-not-allowed opacity-45" : pending && "cursor-progress",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "font-label w-14 text-right text-[0.78rem] font-bold transition-colors",
          pending ? "text-faint-foreground" : checked ? "text-foreground" : "text-dim-foreground",
        )}
      >
        {pending ? "Saving" : checked ? onLabel : offLabel}
      </span>
      <Switch
        size="lg"
        variant="labelled"
        checked={checked}
        onCheckedChange={(next) => {
          if (!pending && !unavailable) onChange(next);
        }}
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        aria-busy={pending || undefined}
        // aria-disabled, not disabled: a disabled switch drops the focus it
        // just took, so a keyboard member would lose their place on each save,
        // and an unavailable switch stays reachable so its reason is read out.
        aria-disabled={pending || unavailable || undefined}
        className={cn(pending && "opacity-70")}
      />
    </label>
  );
}
