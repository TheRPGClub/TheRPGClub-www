"use client";

import { Trash2 } from "lucide-react";
import { deleteRunAction } from "@/app/actions/challenge-runs";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useRunNotice } from "@/components/challenges/run-notice";

// Deletes the viewer's own ended Run (a small signal-orange outline trash
// button, asked first; the confirm is signal orange solid). It comes off
// their profile for good. A refusal goes to the nearest notice slip.
export function DeleteRunButton({
  runId,
  challengeName,
  className,
}: {
  runId: number;
  // Named where the page doesn't already (a profile's stamps).
  challengeName?: string;
  // Placement only.
  className?: string;
}) {
  const setNotice = useRunNotice();
  const of = challengeName ? ` of ${challengeName}` : "";
  return (
    <ConfirmDialog
      trigger={
        <Button
          type="button"
          variant="destructive-outline"
          size="icon-xs"
          aria-label={`Delete your Run${of}`}
          title="Delete this Run"
          className={className}
        >
          <Trash2 aria-hidden />
        </Button>
      }
      title={`Delete your Run${of}?`}
      description="It comes off your profile and the Challenge page for good. This can't be undone."
      confirmLabel="Delete"
      pendingLabel="Deleting…"
      confirmIcon={<Trash2 aria-hidden />}
      onConfirm={async () => {
        setNotice(null);
        const result = await deleteRunAction(runId);
        if (!result.ok) setNotice({ title: "Still here", message: result.error ?? "That didn't work." });
        return null;
      }}
    />
  );
}
