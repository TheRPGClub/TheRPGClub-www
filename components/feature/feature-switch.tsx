"use client";

import { cn } from "@/lib/utils";

// The settings on/off switch: a hard-cornered track that fills highlighter
// yellow when on (the member's own choice) with an ink block riding to the
// right, and an ink-3 well with a muted block on the left when off. The
// state is also spelled out in label type beside it, so it never rests on
// colour alone. An unavailable switch keeps its position but dims and does
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
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      aria-busy={pending || undefined}
      // aria-disabled, not disabled: a disabled button drops the focus it
      // just took, so a keyboard member would lose their place on each save,
      // and an unavailable switch stays reachable so its reason is read out.
      aria-disabled={pending || unavailable || undefined}
      onClick={() => {
        if (!pending && !unavailable) onChange(!checked);
      }}
      className={cn(
        "group/switch -my-2 -mr-2 flex shrink-0 items-center gap-3 rounded-sm py-2 pr-2 pl-3 outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        unavailable ? "cursor-not-allowed opacity-45" : "aria-disabled:cursor-progress",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "font-label w-14 text-right text-[0.78rem] font-bold transition-colors",
          pending ? "text-paper-mute" : checked ? "text-paper" : "text-paper-dim",
        )}
      >
        {pending ? "Saving" : checked ? onLabel : offLabel}
      </span>
      <span
        aria-hidden
        className={cn(
          "relative h-6 w-11 rounded-[3px] transition-colors duration-200",
          checked
            ? cn("bg-highlight", !unavailable && "group-hover/switch:bg-highlight/85")
            : cn(
                "bg-ink-3 shadow-[inset_0_0_0_1px_var(--color-rule-strong)]",
                !unavailable && "group-hover/switch:shadow-[inset_0_0_0_1px_var(--color-paper-mute)]",
              ),
          pending && "opacity-70",
        )}
      >
        <span
          className={cn(
            "absolute top-[3px] left-[3px] size-[18px] rounded-xs motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-[cubic-bezier(0.2,0.8,0.2,1)]",
            checked ? "translate-x-5 bg-ink" : "translate-x-0 bg-paper-mute",
          )}
        />
      </span>
    </button>
  );
}
