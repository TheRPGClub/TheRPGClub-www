import type { FeatureState } from "@/lib/features";
import { changeWhen, changerName, isCommand, STATE_LABEL, type FeatureFlagEntry } from "@/lib/feature-flags";
import { cn } from "@/lib/utils";

// Each state's ink on the desk: Live in done green, Preview in highlighter
// yellow, Off in masthead red (themes/monthly-issue/README.md, Production desk: the Off-red
// exception). Type and strokes only, never a fill behind type.
const STATE_INK: Record<FeatureState, string> = {
  live: "text-ok",
  preview: "text-highlight",
  off: "text-gotm",
};

export const COVERAGE = [
  { key: "website", label: "Website" },
  { key: "bot", label: "Bot" },
  { key: "posts", label: "Posts" },
] as const;

// What one flag switches on one surface, as neutral chips; a bot command
// keeps its case. A dash when it switches nothing there.
export function CoverageChips({ items }: { items: string[] }) {
  if (items.length === 0) {
    return (
      <span className="inline-block h-[1.5px] w-3 translate-y-[-3px] bg-border-strong">
        <span className="sr-only">None</span>
      </span>
    );
  }
  return (
    <ul className="flex flex-wrap gap-[5px]">
      {items.map((item) => (
        <li
          key={item}
          className={cn(
            "font-label inline-flex min-h-[22px] max-w-full min-w-0 items-center rounded-xs bg-foreground/8 px-[7px] py-[3px] text-[0.78rem] leading-[1.15] tracking-[0.04em] text-dim-foreground",
            isCommand(item) ? "tracking-[0.02em] whitespace-nowrap normal-case" : "[overflow-wrap:anywhere]",
          )}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

// The last change: its state in that state's ink, who and when, and the
// reason quoted. A change that just landed slides in.
export function LastChange({ entry, clock, landed }: { entry: FeatureFlagEntry; clock: Date; landed: boolean }) {
  const change = entry.last_change;
  if (!change) {
    return (
      <span className="font-label text-[0.72rem] leading-[1.3] tracking-[0.06em] text-faint-foreground">
        Never set
      </span>
    );
  }
  return (
    <div
      key={change.changed_at}
      className={cn(
        landed && "motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-left-1 motion-safe:duration-300",
      )}
    >
      <span className="font-label block text-[0.72rem] leading-[1.3] tracking-[0.06em] text-faint-foreground tabular-nums">
        <b className={cn("font-extrabold", STATE_INK[change.to_state])}>{STATE_LABEL[change.to_state]}</b>
        {" · "}
        <span className="text-dim-foreground">{changerName(change)}</span>
        {" · "}
        <time dateTime={change.changed_at} title={new Date(change.changed_at).toUTCString()}>
          {changeWhen(change.changed_at, clock)}
        </time>
      </span>
      {change.reason && (
        <q className="mt-0.5 block text-[0.8rem] leading-[1.3] text-dim-foreground italic">{change.reason}</q>
      )}
    </div>
  );
}
