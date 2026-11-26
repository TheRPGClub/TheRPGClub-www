import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import type { Feedback } from "@/lib/api/types";
import { PHASE_INK, feedbackPhase, pinnedHref, shortDate, type DuplicateOriginal } from "@/lib/feedback";
import { cn } from "@/lib/utils";
import { FeedbackBand } from "./feedback-band";
import { RoadmapPin } from "./roadmap-pin";
import { ClosedSlip, slipTilt } from "./rejection-slip";
import { ScreenshotThumb } from "./screenshot-thumb";

// A Feedback on the board: a straight card (6px corners, soft shadow), its
// header band filled with the status ink and carrying the upvote count. A
// Bug Report says where it happened and shows its screenshot; a Rejected
// or Duplicate card carries a taped-on slip. No kind badge: the tab says it.
// Feedback linked to a Roadmap Item wears the Roadmap badge pinned to its
// top-right corner.
//
// Hook-free, so the board, the form's live preview and the review desk all
// render the same card. Interactive controls come in through `actions`.
export interface FeedbackCardProps {
  feedback: Feedback;
  // The viewer wrote it: a yellow "Yours" while it is Pending.
  mine?: boolean;
  reviewerName?: string | null;
  // A Duplicate's original, linked from its slip.
  original?: DuplicateOriginal | null;
  // Footer controls (upvote, edit, withdraw, review).
  actions?: ReactNode;
  // A yellow ring: the card a link pinned.
  highlight?: boolean;
  // "just now" in place of the date, for the form's preview.
  bylineWhen?: string;
  headingLevel?: "h2" | "h3";
  className?: string;
}

const WHERE: Record<string, string> = { bot: "In the bot", website: "On the website" };

export function FeedbackCard({
  feedback: f,
  mine = false,
  reviewerName,
  original,
  actions,
  highlight = false,
  bylineWhen,
  headingLevel: Heading = "h3",
  className,
}: FeedbackCardProps) {
  const phase = feedbackPhase(f);
  // A re-kinded Feedback keeps what it was filed with: a Bug Report's body
  // is what happened, anything else's its details, each falling back to the
  // other when empty.
  const body = f.kind === "bug_report" ? f.what_happened || f.details : f.details || f.what_happened;
  const showBody = body && phase !== "rejected" && phase !== "duplicate";

  return (
    <article
      id={`feedback-${f.feedback_id}`}
      aria-label={f.title}
      style={{ "--band": PHASE_INK[phase] } as CSSProperties}
      className={cn(
        "relative scroll-mt-24 rounded-md bg-card shadow-[0_10px_24px_rgb(0_0_0/0.45)]",
        highlight && "ring-2 ring-highlight",
        (phase === "rejected" || phase === "duplicate") && "pb-4",
        className,
      )}
    >
      <FeedbackBand feedback={f} phase={phase} pinned={!!f.roadmap} />
      {f.roadmap && <RoadmapPin roadmap={f.roadmap} />}

      <div className="px-3.5 pt-3 pb-3.5">
        <Heading className="text-[1.05rem] leading-snug font-semibold break-words text-foreground">{f.title}</Heading>
        {f.where && (
          <p className="font-label mt-1 text-[0.74rem] font-bold text-faint-foreground">{WHERE[f.where] ?? f.where}</p>
        )}
        {showBody && (
          <p className="mt-1.5 line-clamp-6 text-[0.88rem] leading-normal break-words whitespace-pre-line text-dim-foreground">
            {body}
          </p>
        )}
        {f.screenshot_url && <ScreenshotThumb url={f.screenshot_url} title={f.title} />}
        {mine && phase === "pending" && (
          <span className="font-label mt-2 block text-[0.74rem] font-extrabold text-highlight">Yours</span>
        )}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-2.5">
          <span className="text-[0.82rem] text-faint-foreground">
            by <b className="font-semibold text-dim-foreground">{f.created_by_name ?? "Unknown"}</b>
            {" · "}
            {bylineWhen ?? shortDate(f.created_at)}
          </span>
          {actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
        </div>
      </div>

      {phase === "rejected" && f.rejection_reason && (
        <ClosedSlip heading="Reason" signedBy={reviewerName} tilt={slipTilt(f.feedback_id)}>
          {f.rejection_reason}
        </ClosedSlip>
      )}
      {phase === "duplicate" && (
        <ClosedSlip heading="Duplicate" tilt={slipTilt(f.feedback_id)}>
          Duplicate of{" "}
          {original ? (
            <Link href={pinnedHref(original)} className="font-semibold not-italic underline decoration-1 underline-offset-2">
              {original.title}
            </Link>
          ) : f.duplicate_of_id ? (
            <Link href={`/feedback?pinned=${f.duplicate_of_id}`} className="underline">
              another Feedback
            </Link>
          ) : (
            "another Feedback"
          )}
        </ClosedSlip>
      )}
    </article>
  );
}
