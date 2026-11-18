"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { changeHostAction, deleteChallengeAction, setChallengeHiddenAction } from "@/app/actions/challenges";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChangeHostDialog } from "@/components/challenges/change-host-dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";

// The Moderators' tools on a Challenge page (surface brief challenges-pool):
// an outline "Staff" menu that hides or unhides it, hands it to another
// member or to the club, or removes it with its Runs. The API decides; a
// refusal shows under the menu.
export function StaffMenu({
  challengeId,
  name,
  hidden,
  clubHosted,
  runCount,
}: {
  challengeId: number;
  name: string;
  hidden: boolean;
  clubHosted: boolean;
  runCount: number;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [hostOpen, setHostOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const run = (act: () => Promise<{ ok: boolean; error?: string }>) =>
    startTransition(async () => {
      const result = await act();
      setError(result.ok ? null : (result.error ?? "That didn't work."));
    });

  return (
    <div className="flex flex-col items-start gap-1.5 lg:items-end">
      <DropdownMenu>
        <DropdownMenuTrigger disabled={pending} render={<Button type="button" variant="outline" size="sm" />}>
          Staff
          <ChevronDown aria-hidden className="motion-safe:transition-transform group-aria-expanded/button:rotate-180" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-52">
          <DropdownMenuItem onClick={() => run(() => setChallengeHiddenAction(challengeId, !hidden))}>
            {hidden ? "Unhide" : "Hide from members"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setHostOpen(true)}>Change Host…</DropdownMenuItem>
          {!clubHosted && (
            <DropdownMenuItem onClick={() => run(() => changeHostAction(challengeId, { club: true }))}>
              Hand to the club
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setDeleteOpen(true)}>Remove Challenge…</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {error && (
        <p role="alert" className="max-w-xs text-sm text-destructive">
          {error}
        </p>
      )}
      <ChangeHostDialog challengeId={challengeId} open={hostOpen} onOpenChange={setHostOpen} />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Remove ${name}?`}
        description={
          runCount > 0
            ? `Its ${runCount} ${runCount === 1 ? "Run goes" : "Runs go"} with it. This can't be undone.`
            : "This can't be undone."
        }
        confirmLabel="Remove"
        pendingLabel="Removing…"
        onConfirm={async () => {
          const result = await deleteChallengeAction(challengeId);
          if (!result.ok) return result.error ?? "That didn't work.";
          router.push("/challenges");
          return null;
        }}
      />
    </div>
  );
}
