import { Clock3 } from "lucide-react";

import { gameTrack } from "@/components/issue/game-track";
import type { Game } from "@/lib/api/types";
import { draftFirstLine, lastTouched, touchedAt } from "@/lib/reviews/drafts";
import { cn } from "@/lib/utils";
import type { ReviewDraftEntry } from "@/lib/api/types";

// The small parts every Draft in the pile carries.

// The score box, unprinted: the paper block as an outline only, dashed and
// empty while there is no score yet.
export function DraftScoreBox({ rating, size = "md" }: { rating: number | null; size?: "sm" | "md" }) {
  const box = size === "sm" ? "size-12" : "size-[58px]";
  if (rating == null) {
    return (
      <span
        className={cn(
          "font-label grid shrink-0 place-items-center rounded-[2.4px] border-2 border-dashed border-border-strong p-1 text-center text-[0.66rem] leading-[1.1] font-extrabold text-faint-foreground",
          box,
        )}
      >
        No score yet
      </span>
    );
  }
  return (
    <span
      aria-label={`Score ${rating}`}
      className={cn(
        "font-headline grid shrink-0 place-items-center rounded-[2.4px] leading-none shadow-[inset_0_0_0_2px_var(--foreground)]",
        box,
        size === "sm" ? "text-[1.7rem]" : "text-[2.1rem]",
      )}
    >
      {rating}
    </span>
  );
}

const TRACK_PILL = {
  gotm: { label: "GOTM", className: "bg-gotm text-gotm-foreground" },
  nr_gotm: { label: "NR-GOTM", className: "bg-nr text-nr-foreground" },
} as const;

// The pill row: the game's track pill (when it won one), then the state pill
// with its corner cut like the page's. Never split, so it wraps as one.
export function DraftPills({
  game,
  kind = "review",
}: {
  game?: Pick<Game, "gotm_won" | "nr_gotm_won"> | null;
  kind?: ReviewDraftEntry["kind"];
}) {
  const track = gameTrack(game);
  const pill = "font-label inline-flex h-[21px] items-center text-[0.72rem] font-extrabold whitespace-nowrap";
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5">
      {track && (
        <span className={cn(pill, "rounded-xs px-[7px]", TRACK_PILL[track].className)}>
          {TRACK_PILL[track].label}
        </span>
      )}
      <span
        className={cn(
          pill,
          "bg-muted pr-2.5 pl-[7px] text-foreground shadow-[inset_0_0_0_1px_var(--border-strong)] [clip-path:polygon(0_0,calc(100%-6px)_0,100%_6px,100%_100%,0_100%)]",
        )}
      >
        {kind === "revision" ? "Draft Revision" : "Draft"}
      </span>
    </span>
  );
}

// "Last touched 12 min ago", the exact time in its title.
export function DraftTouched({ at, now, className }: { at: string; now: number; className?: string }) {
  return (
    <span
      title={`Last touched ${touchedAt(at)}`}
      className={cn(
        "font-label inline-flex items-center gap-1.5 text-[0.82rem] font-bold whitespace-nowrap text-faint-foreground [&_svg]:size-[13px]",
        className,
      )}
    >
      <Clock3 aria-hidden />
      Last touched {lastTouched(at, now)}
    </span>
  );
}

// The first line of whatever is written so far.
export function DraftFirstLine({
  draft,
  lines = 2,
  className,
}: {
  draft: Pick<ReviewDraftEntry, "body" | "title">;
  lines?: 1 | 2;
  className?: string;
}) {
  const line = draftFirstLine(draft);
  return (
    <p
      className={cn(
        "m-0 leading-[1.55]",
        lines === 1 ? "truncate" : "line-clamp-2",
        line ? "text-foreground/88" : "text-faint-foreground italic",
        className,
      )}
    >
      {line ?? "Nothing written yet"}
    </p>
  );
}
