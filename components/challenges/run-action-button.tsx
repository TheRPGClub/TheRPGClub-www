"use client";

import { useTransition } from "react";
import { Flag, Play } from "lucide-react";
import { abandonRunAction, startRunAction } from "@/app/actions/challenge-runs";
import type { RunAction } from "@/lib/challenges/run-action";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useRunNotice } from "@/components/challenges/run-notice";

// The viewer's Run action at the right of a Challenge page's switch rule
// (surface brief challenges-pool): Start a Run in yellow, the signal-orange
// outline Abandon your Run (asked first), or Start a Run disabled with why.
// A refusal goes to the page's notice slip.
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
  const [pending, startTransition] = useTransition();

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
  const start = () =>
    startTransition(async () => {
      setNotice(null);
      const result = await startRunAction(challengeId);
      if (!result.ok) setNotice({ title: "No Run just yet", message: result.error ?? "That didn't work." });
    });
  return (
    <span className="inline-flex items-center gap-3">
      {closed && (
        <span className="font-label text-[0.8rem] tracking-[0.08em] text-faint-foreground">{action.reason}</span>
      )}
      <Button type="button" variant="highlight" size="sm" disabled={closed || pending} onClick={start}>
        <Play aria-hidden />
        {pending ? "Starting…" : action.kind === "start" && action.again ? "Start a new Run" : "Start a Run"}
      </Button>
    </span>
  );
}
