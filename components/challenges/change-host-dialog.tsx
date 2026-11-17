"use client";

import { useId, useState, useTransition } from "react";
import type { User } from "@/lib/api/types";
import { changeHostAction } from "@/app/actions/challenges";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { MemberPicker } from "@/components/admin/member-picker";

// Staff hand a Challenge to another member (who needs no role): pick them,
// then Hand it over. The API refuses an unknown member with its message.
export function ChangeHostDialog({
  challengeId,
  open,
  onOpenChange,
}: {
  challengeId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const labelId = useId();
  const [member, setMember] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const close = (next: boolean) => {
    if (pending) return;
    onOpenChange(next);
    if (!next) {
      setMember(null);
      setError(null);
    }
  };

  const save = () => {
    if (!member) return;
    startTransition(async () => {
      const result = await changeHostAction(challengeId, {
        userId: member.user_id,
      });
      if (result.ok) close(false);
      else setError(result.error ?? "That didn't work.");
    });
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Host</DialogTitle>
          <DialogDescription>The new Host can edit the Challenge and its rules until a Run starts.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label variant="field" id={labelId}>
            New Host
          </Label>
          <MemberPicker value={member} onChange={setMember} disabled={pending} autoFocus labelId={labelId} />
        </div>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => close(false)} disabled={pending}>
            Cancel
          </Button>
          <Button type="button" variant="highlight" onClick={save} disabled={!member || pending}>
            {pending ? "Handing over…" : "Hand it over"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
