import {
  CircleCheck,
  CircleDot,
  ExternalLink,
  Hourglass,
  Undo2,
  X,
  type LucideIcon,
} from "lucide-react";
import type { Suggestion } from "@/lib/api/types";
import { PHASE_LABEL, issueRef, shortDate, votesLabel, type SuggestionPhase } from "@/lib/suggestions";
import { cn } from "@/lib/utils";

const PHASE_ICON: Record<SuggestionPhase, LucideIcon> = {
  pending: Hourglass,
  approved: CircleDot,
  done: CircleCheck,
  rejected: X,
  withdrawn: Undo2,
};

// A Suggestion card's header band, filled with the status ink (the card sets
// --band): the phase, its GitHub issue and the upvote count.
export function SuggestionBand({
  suggestion: s,
  phase,
  mine,
}: {
  suggestion: Suggestion;
  phase: SuggestionPhase;
  mine: boolean;
}) {
  const Icon = PHASE_ICON[phase];
  const ref = issueRef(s);
  const reviewed = phase === "rejected" || phase === "withdrawn";
  return (
    <header
      className={cn(
        "flex items-center justify-between gap-3 rounded-t-md px-3.5 py-2 text-background",
        phase === "withdrawn"
          ? "text-faint-foreground shadow-[inset_0_0_0_1px_var(--band)]"
          : "bg-(--band)",
      )}
    >
      <p className="font-label flex min-w-0 items-center gap-1.5 text-[0.85rem] font-extrabold">
        <Icon aria-hidden className="size-3.5 shrink-0" />
        <span className="truncate">
          {PHASE_LABEL[phase]}
          {reviewed && s.reviewed_at && <> · {shortDate(s.reviewed_at)}</>}
          {mine && phase === "pending" && <> · yours</>}
        </span>
        {ref &&
          (s.github_issue_url ? (
            <a
              href={s.github_issue_url}
              target="_blank"
              rel="noreferrer"
              title={
                s.github_issue_state === "closed"
                  ? "GitHub issue, closed"
                  : s.github_issue_state === "open"
                    ? "GitHub issue, open"
                    : "GitHub issue"
              }
              className="inline-flex shrink-0 items-center gap-1 border-b-[1.5px] border-current leading-tight hover:opacity-75"
            >
              · {ref}
              <ExternalLink aria-hidden className="size-3" />
            </a>
          ) : (
            <span className="shrink-0">· {ref}</span>
          ))}
      </p>
      <p className="flex shrink-0 items-baseline">
        <span
          className={cn(
            "font-headline leading-[0.85]",
            reviewed ? "text-2xl" : "text-[1.9rem]",
          )}
        >
          {s.upvote_count}
        </span>
        <span
          className={cn(
            "font-label ml-1 text-[0.72rem]",
            reviewed ? "" : "sr-only",
          )}
        >
          {votesLabel(s.upvote_count)}
        </span>
      </p>
    </header>
  );
}
