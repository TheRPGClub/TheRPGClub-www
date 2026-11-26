"use client";

import { useState } from "react";
import type { Feedback } from "@/lib/api/types";
import { FEEDBACK_KINDS } from "@/lib/feedback";
import { laneRows, rowsAfterDuplicate } from "@/lib/feedback-desk";
import { STAFF_DESK_BACK } from "@/lib/staff";
import { PageHeader } from "@/components/templates/page-header";
import { DeskLane } from "./desk-lane";
import { DeskNotice, type DeskDecision } from "./desk-notice";
import { DeskSheet } from "./desk-sheet";

// The review desk (the locked "desk-lanes" sketch): Pending Feedback in
// three kind lanes, most upvoted first, so a misfiled one stands out.
// Opening a card rings it and opens the Sheet; once decided the card leaves
// its lane (or moves lanes when its kind changes) and the outcome shows
// above the lanes with the bot's announcement job.
export function FeedbackDesk({ rows: initial }: { rows: Feedback[] | null }) {
  const [rows, setRows] = useState(initial ?? []);
  const [openId, setOpenId] = useState<number | null>(null);
  // The Sheet keeps showing its Feedback while it slides out.
  const [shown, setShown] = useState<Feedback | null>(null);
  const [decision, setDecision] = useState<DeskDecision | null>(null);

  function open(f: Feedback) {
    setShown(f);
    setOpenId(f.feedback_id);
  }

  function changed(f: Feedback) {
    setRows((all) => all.map((r) => (r.feedback_id === f.feedback_id ? f : r)));
    setShown(f);
  }

  function decided(next: DeskDecision) {
    setRows((all) =>
      next.originalId
        ? rowsAfterDuplicate(all, next.feedback.feedback_id, next.originalId, next.original ?? null)
        : all.filter((r) => r.feedback_id !== next.feedback.feedback_id),
    );
    setDecision(next);
    setOpenId(null);
  }

  // Someone else decided it first: it leaves its lane, and the Sheet stays
  // open to say so.
  function gone(id: number) {
    setRows((all) => all.filter((r) => r.feedback_id !== id));
  }

  return (
    <div className="space-y-6">
      <PageHeader
        back={STAFF_DESK_BACK}
        title="Feedback review"
        count={initial ? `${rows.length} pending` : undefined}
      />

      {decision && <DeskNotice decision={decision} onDismiss={() => setDecision(null)} />}

      {initial === null ? (
        <p role="alert" className="text-destructive">
          {"Couldn't load the Feedback. Refresh to try again."}
        </p>
      ) : (
        <div className="grid items-start gap-x-4 gap-y-8 md:grid-cols-3">
          {FEEDBACK_KINDS.map((k) => (
            <DeskLane
              key={k.value}
              kind={k}
              rows={laneRows(rows, k.value)}
              openId={openId}
              onOpen={open}
            />
          ))}
        </div>
      )}

      <DeskSheet
        feedback={shown}
        open={openId !== null}
        onClose={() => setOpenId(null)}
        onChanged={changed}
        onDecided={decided}
        onGone={gone}
      />
    </div>
  );
}
