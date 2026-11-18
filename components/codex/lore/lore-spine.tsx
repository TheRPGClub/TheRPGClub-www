import type { CodexEntry } from "@/lib/codex/types";
import { initials } from "@/lib/challenges/runs";
import { spineDate } from "@/lib/codex/codex-date";
import { spineHeight, spineWidth, type SpineBinding } from "@/lib/codex/shelf";
import { cn } from "@/lib/utils";

// The three bindings: jade with ink type; ink (`muted`) with paper type
// under a 6px jade cap (drawn in the spine); paper with ink type.
const BINDING = {
  jade: "bg-codex-lore text-background",
  ink: "bg-muted text-foreground",
  paper: "bg-foreground text-background",
} as const;

// A Lore Entry standing on the shelf (4D): its title set sideways, a rule,
// its date and its author's initials; as wide as its story is long, at a
// stable, slightly uneven height. The picked one lifts and takes the yellow
// ring; the viewer's own carry the yellow "Yours" tag.
export function LoreSpine({
  entry,
  binding,
  picked,
  yours,
}: {
  entry: CodexEntry;
  binding: SpineBinding;
  picked: boolean;
  yours: boolean;
}) {
  return (
    <span
      style={{
        width: `calc(${spineWidth(entry.body?.length ?? 0)}px * var(--spine-scale))`,
        height: `calc(${spineHeight(entry.id)}px * var(--spine-scale))`,
      }}
      className={cn(
        "relative flex shrink-0 flex-col items-center rounded-t-[2.4px] pt-3.5 pb-3 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.12),inset_-6px_0_10px_-6px_rgb(0_0_0/0.35)]",
        "motion-safe:transition-[translate,box-shadow] motion-safe:duration-200",
        BINDING[binding],
        picked && "-translate-y-[22px] ring-2 ring-highlight ring-inset shadow-[0_14px_28px_rgb(0_0_0/0.55)]",
      )}
    >
      {binding === "ink" && <span aria-hidden className="absolute inset-x-0 top-0 h-1.5 rounded-t-[2.4px] bg-codex-lore" />}
      {yours && (
        <span className="font-label absolute -top-2.5 left-1/2 z-10 -translate-x-1/2 -rotate-4 rounded-[2px] bg-highlight px-1.5 py-0.5 text-[0.6875rem] font-extrabold tracking-[0.08em] text-highlight-foreground">
          Yours
        </span>
      )}
      <span className="font-headline min-h-0 flex-1 rotate-180 overflow-hidden text-[calc(25px*var(--spine-scale))] leading-[1.02] text-ellipsis [writing-mode:vertical-rl]">
        <span className="line-clamp-2 max-h-[calc(360px*var(--spine-scale))]">{entry.title}</span>
      </span>
      <span aria-hidden className="mt-3 h-px w-4/5 bg-current opacity-60" />
      <span className="font-label mt-2 px-1 text-center text-[0.6875rem] leading-tight font-bold tracking-[0.06em]">
        {spineDate(entry.occurred_on, entry.date_precision)}
      </span>
      <span className="font-label mt-1 text-[0.75rem] font-extrabold opacity-75">{initials(entry.author.name)}</span>
    </span>
  );
}
