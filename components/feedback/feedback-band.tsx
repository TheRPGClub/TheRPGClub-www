import {
  CircleCheck,
  CircleDot,
  Copy,
  ExternalLink,
  Hourglass,
  Undo2,
  X,
  type LucideIcon,
} from "lucide-react";
import type { Feedback } from "@/lib/api/types";
import { PHASE_LABEL, isClosedPhase, issueRef, shortDate, votesLabel, type FeedbackPhase } from "@/lib/feedback";
import { cn } from "@/lib/utils";

const PHASE_ICON: Record<FeedbackPhase, LucideIcon> = {
  pending: Hourglass,
  approved: CircleDot,
  done: CircleCheck,
  rejected: X,
  duplicate: Copy,
  withdrawn: Undo2,
};

// A Feedback card's header band, filled with the status ink (the card sets
// --band): the phase, its GitHub issue (linked) and the upvote count.
// `pinned` makes room for the Roadmap badge on the card's corner, so the
// count sits clear of it.
export function FeedbackBand({ feedback: f, phase, pinned = false }: { feedback: Feedback; phase: FeedbackPhase; pinned?: boolean }) {
  const Icon = PHASE_ICON[phase];
  const ref = issueRef(f);
  const closed = isClosedPhase(phase);
  return (
    <header
      className={cn(
        "flex items-center justify-between gap-3 rounded-t-md px-3.5 py-2 text-background",
        phase === "withdrawn" ? "text-faint-foreground shadow-[inset_0_0_0_1px_var(--band)]" : "bg-(--band)",
        pinned && "pr-[10.25rem]",
      )}
    >
      <p
        className={cn(
          "font-label flex min-w-0 items-center gap-1.5 text-[0.85rem] font-extrabold",
          // Beside the Roadmap badge the issue wraps under the phase rather
          // than cutting it short.
          pinned && "flex-wrap gap-y-0.5",
        )}
      >
        <Icon aria-hidden className="size-3.5 shrink-0" />
        <span className={pinned ? "whitespace-nowrap" : "truncate"}>
          {PHASE_LABEL[phase]}
          {closed && f.reviewed_at && <> · {shortDate(f.reviewed_at)}</>}
        </span>
        {ref &&
          (f.github_issue_url ? (
            <a
              href={f.github_issue_url}
              target="_blank"
              rel="noreferrer"
              title={phase === "done" ? "GitHub issue, done" : "GitHub issue"}
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
        <span className={cn("font-headline leading-[0.85]", closed ? "text-2xl" : "text-[1.9rem]")}>
          {f.upvote_count}
        </span>
        <span className={cn("font-label ml-1 text-[0.72rem]", closed ? "" : "sr-only")}>
          {votesLabel(f.upvote_count)}
        </span>
      </p>
    </header>
  );
}
