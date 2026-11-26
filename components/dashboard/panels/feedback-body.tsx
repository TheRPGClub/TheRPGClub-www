import { FEEDBACK_ACTIVITY_LABEL, ageLabel, feedbackActivity, feedbackActivityAt } from "@/lib/dashboard/panel-items";
import { readFeedback } from "@/lib/dashboard/panel-sources";
import { pinnedHref } from "@/lib/feedback";
import { PANELS } from "@/lib/dashboard/panels";
import { MetaParts, PanelItem, PanelWhen } from "./panel-list";
import { listBody } from "./body-kit";
import type { BodyProps } from "./panel-body";

// Feedback Board: the open Feedback (Pending and Approved, Done included)
// with the latest activity (a submission, a review, a Done or an upvote),
// each led by its upvotes and linked to its place on the board.
export async function FeedbackBody({ wide }: BodyProps) {
  const feedback = await readFeedback();
  const now = Date.now();
  return listBody({
    rows: feedback,
    title: PANELS.feedback.title,
    wide,
    row: (s) => (
      <PanelItem
        key={s.feedback_id}
        media={<Votes count={s.upvote_count} />}
        title={s.title}
        href={pinnedHref(s)}
        meta={<MetaParts parts={[<b key="k">{FEEDBACK_ACTIVITY_LABEL[feedbackActivity(s)]}</b>, s.created_by_name]} />}
        aside={<PanelWhen>{ageLabel(feedbackActivityAt(s), now)}</PanelWhen>}
      />
    ),
  });
}

// The upvotes as an Anton figure over "votes", in the panel's ink.
function Votes({ count }: { count: number }) {
  return (
    <span className="flex w-10 flex-col items-center gap-0.5">
      <b className="font-headline text-[1.45rem] leading-[0.9] font-normal text-(--panel-ink)">{count}</b>
      <span className="font-label text-[0.65rem] leading-none font-bold tracking-[0.08em] text-faint-foreground">
        {count === 1 ? "vote" : "votes"}
      </span>
    </span>
  );
}
