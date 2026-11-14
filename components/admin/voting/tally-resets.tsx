"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { resetVotesAction } from "@/app/actions/voting-console";
import type { VotingCategory, VotingRound } from "@/lib/api/types";
import { CATEGORY_SHORT } from "@/lib/voting-console";
import { TypedConfirmButton } from "@/components/admin/desk/typed-confirm";

// A category's resets, each behind a typed confirm: the whole vote, and the
// runoff ballot when the round had one. The count deleted reads under them.
export function TallyResets({
  round,
  category,
  total,
  hasRunoff,
}: {
  round: VotingRound;
  category: VotingCategory;
  total: number;
  hasRunoff: boolean;
}) {
  const label = CATEGORY_SHORT[category];
  const n = round.round_number;
  const [notice, setNotice] = useState<string | null>(null);

  const reset = (runoff: boolean) => async () => {
    setNotice(null);
    const result = await resetVotesAction(category, n, runoff);
    if (!result.ok) return { error: result.error };
    const count = result.data?.count ?? 0;
    setNotice(
      `Deleted ${count} ${label}${runoff ? " runoff" : ""} ${count === 1 ? "vote" : "votes"} for Round ${n}.`,
    );
  };

  return (
    <div className="mt-5.5 flex flex-col items-start gap-3">
      <TypedConfirmButton
        triggerLabel={`Reset ${label} votes`}
        triggerIcon={RotateCcw}
        label={`Reset ${label} votes`}
        question={`Delete all ${total} ${label} ${total === 1 ? "vote" : "votes"} for Round ${n}?`}
        words={`RESET ${label}`}
        actionLabel="Reset"
        actionIcon={RotateCcw}
        onConfirm={reset(false)}
      >
        Members vote again from scratch.{" "}
        {category === "gotm" ? "NR-GOTM" : "GOTM"} stays as it is.
      </TypedConfirmButton>
      {hasRunoff && (
        <TypedConfirmButton
          triggerLabel={`Reset ${label} runoff votes`}
          triggerIcon={RotateCcw}
          label={`Reset ${label} runoff votes`}
          question={`Delete every ${label} runoff vote for Round ${n}?`}
          words={`RESET ${label} RUNOFF`}
          actionLabel="Reset"
          actionIcon={RotateCcw}
          onConfirm={reset(true)}
        >
          Only the runoff ballot. The main vote stays as it is.
        </TypedConfirmButton>
      )}
      {notice && (
        <p role="status" className="text-[0.86rem] text-dim-foreground">
          {notice}
        </p>
      )}
    </div>
  );
}
