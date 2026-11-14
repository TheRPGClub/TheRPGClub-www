import type { CSSProperties, ReactNode } from "react";
import type { Suggestion } from "@/lib/api/types";
import {
  PHASE_INK,
  cardTilt,
  parseSuggestionLabels,
  shortDate,
  suggestionPhase,
  suggestionTypeInk,
} from "@/lib/suggestions";
import { cn } from "@/lib/utils";
import { RejectionSlip } from "./rejection-slip";
import { SuggestionBand } from "./suggestion-band";

// A Suggestion pinned to the board: a card at a slight, stable tilt, its
// header band filled with the status ink and carrying the upvote count.
// Approved cards link their GitHub issue, a closed issue gets a Done stamp,
// and a Rejected card carries its reason on a taped-on paper slip.
//
// Presentational and hook-free, so the board, the form's live preview and
// the Superadmin review page all render the same card. Interactive controls
// come in through `actions` (the footer's right side).

export interface SuggestionCardProps {
  suggestion: Suggestion;
  // The viewer wrote it: the band says "yours".
  mine?: boolean;
  // Shown on the rejection slip; omitted when unknown.
  reviewerName?: string | null;
  // Footer controls (upvote, withdraw, review). Without them the byline
  // joins the labels row, as on the Rejected tab.
  actions?: ReactNode;
  // A yellow ring: the card the member just pinned.
  highlight?: boolean;
  // "just now" in place of the date, for the form's preview.
  bylineWhen?: string;
  // Pages stay square; set false where the card is not on a wall.
  tilted?: boolean;
  headingLevel?: "h2" | "h3";
  className?: string;
}

export function SuggestionCard({
  suggestion: s,
  mine = false,
  reviewerName,
  actions,
  highlight = false,
  bylineWhen,
  tilted = true,
  headingLevel: Heading = "h3",
  className,
}: SuggestionCardProps) {
  const phase = suggestionPhase(s);
  const labels = parseSuggestionLabels(s.labels);
  const reviewed = phase === "rejected" || phase === "withdrawn";
  const when = bylineWhen ?? (reviewed ? null : shortDate(s.created_at));

  const byline = (
    <span className="text-[0.82rem] text-faint-foreground">
      by{" "}
      <b className="font-semibold text-dim-foreground">{s.created_by_name ?? "Unknown"}</b>
      {when && <> · {when}</>}
    </span>
  );

  return (
    <article
      aria-label={s.title}
      style={
        {
          "--tilt": tilted ? `${cardTilt(s.suggestion_id)}deg` : "0deg",
          "--band": PHASE_INK[phase],
        } as CSSProperties
      }
      className={cn(
        "relative rotate-(--tilt) rounded-md bg-card shadow-[0_10px_24px_rgb(0_0_0/0.45)] motion-safe:transition-transform motion-safe:duration-200 motion-safe:hover:rotate-0",
        highlight && "ring-2 ring-highlight",
        phase === "rejected" && "pb-4",
        className,
      )}
    >
      <SuggestionBand suggestion={s} phase={phase} mine={mine} />

      <div className="px-3.5 pt-3 pb-3.5">
        <Heading className="text-[1.05rem] leading-snug font-semibold break-words text-foreground">
          {s.title}
        </Heading>
        {s.details && phase !== "rejected" && (
          <p className="mt-1.5 text-[0.88rem] leading-normal break-words whitespace-pre-line text-dim-foreground">
            {s.details}
          </p>
        )}
        {(labels.length > 0 || !actions) && (
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            {labels.map((label) => (
              <span
                key={label}
                style={{ "--lc": suggestionTypeInk(label) } as CSSProperties}
                className="font-label inline-flex h-[22px] items-center rounded-xs px-[7px] text-[0.74rem] whitespace-nowrap text-(--lc) shadow-[inset_0_0_0_1.5px_var(--lc)]"
              >
                {label}
              </span>
            ))}
            {!actions && <span className="ml-1.5">{byline}</span>}
          </div>
        )}
        {actions && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-2.5">
            {byline}
            <div className="ml-auto flex items-center gap-2">{actions}</div>
          </div>
        )}
      </div>

      {phase === "rejected" && s.rejection_reason && (
        <RejectionSlip
          reason={s.rejection_reason}
          reviewerName={reviewerName}
          tilt={-cardTilt(s.suggestion_id + 3) * 2}
        />
      )}

      {phase === "done" && (
        <span
          aria-hidden
          className="font-headline pointer-events-none absolute right-4 bottom-16 -rotate-8 rounded-xs px-2.5 pt-1 pb-0.5 text-[1.7rem] leading-none text-(--band) opacity-90 shadow-[inset_0_0_0_2.5px_var(--band)]"
        >
          Done
        </span>
      )}
    </article>
  );
}
