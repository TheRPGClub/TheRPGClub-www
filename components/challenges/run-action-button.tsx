"use client";

import { Flag, Play } from "lucide-react";
import { abandonRunAction } from "@/app/actions/challenge-runs";
import type { RunAction } from "@/lib/challenges/run-action";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useRunNotice } from "@/components/challenges/run-notice";
import { BirthDatePrompt } from "@/components/challenges/birth-date-prompt";
import { useStartRun } from "@/hooks/use-start-run";

// The viewer's Run action at the right of a Challenge page's switch rule
// (surface brief challenges-pool): Start a Run in yellow, the signal-orange
// outline Abandon your Run (asked first), or Start a Run disabled with why.
// A refusal goes to the page's notice slip, as do a new Run's notices; a
// birth-year Slots Run asks for the Birth Date first.
export function RunActionButton({
  action,
  challengeId,
  challengeName,
}: {
  action: RunAction;
  challengeId: number;
  challengeName: string;
}) {
  const setNotice = useRunNotice();
  const run = useStartRun(challengeId, {
    onRefused: (message) => setNotice({ title: "No Run just yet", message }),
    onStarted: (notices) =>
      notices.length > 0 && setNotice({ title: "Your Run has started", message: notices.map((n) => n.message).join(" ") }),
  });

  if (action.kind === "none") return null;
  if (action.kind === "abandon") {
    return (
      <ConfirmDialog
        trigger={
          <Button type="button" variant="destructive-outline" size="sm">
            <Flag aria-hidden /> Abandon your Run
          </Button>
        }
        title={`Abandon your Run of ${challengeName}?`}
        description="It stays on your profile, Abandoned, until you delete it."
        confirmLabel="Abandon"
        pendingLabel="Abandoning…"
        onConfirm={async () => {
          setNotice(null);
          const result = await abandonRunAction(action.runId);
          if (!result.ok) setNotice({ title: "Still running", message: result.error ?? "That didn't work." });
          return null;
        }}
      />
    );
  }
  const closed = action.kind === "closed";
  const start = () => {
    setNotice(null);
    run.start();
  };
  return (
    <span className="inline-flex items-center gap-3">
      {closed && (
        <span className="font-label text-[0.8rem] tracking-[0.08em] text-faint-foreground">{action.reason}</span>
      )}
      <Button type="button" variant="highlight" size="sm" disabled={closed || run.pending} onClick={start}>
        <Play aria-hidden />
        {run.pending ? "Starting…" : action.kind === "start" && action.again ? "Start a new Run" : "Start a Run"}
      </Button>
      <BirthDatePrompt prompt={run.birthPrompt} pending={run.pending} />
    </span>
  );
}
