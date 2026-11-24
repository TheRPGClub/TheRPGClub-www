"use client";

import { useState, useTransition } from "react";
import type { ProposalView } from "@/lib/challenges/proposals";
import { acceptProposalAction } from "@/app/actions/pool-proposals";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AlsoAddSwitch } from "@/components/challenges/also-add-switch";

export type AcceptAs = "core" | "optional";

const CHOICES: { value: AcceptAs; name: string; line: string }[] = [
  { value: "core", name: "Core", line: "Every Run must Clear it. Members with an active Run get a DM." },
  { value: "optional", name: "Optional", line: "Arrives quietly with a New tag." },
];

// Accepting a Pool Proposal (pick 9A's Accept dialog): Core or Optional,
// opened on the one the decider pressed, and "Also add to <list>" when the
// Challenge's linked Game List takes games from them (`can_add`).
export function AcceptDialog({
  proposal,
  as,
  challenge,
  onClose,
}: {
  proposal: ProposalView | null;
  as: AcceptAs;
  challenge: { id: number; name: string; list: { name: string; canAdd: boolean } | null };
  onClose: () => void;
}) {
  return (
    <Dialog open={proposal !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        {proposal && <AcceptForm key={`${proposal.id}-${as}`} proposal={proposal} initial={as} challenge={challenge} onClose={onClose} />}
      </DialogContent>
    </Dialog>
  );
}

function AcceptForm({
  proposal,
  initial,
  challenge,
  onClose,
}: {
  proposal: ProposalView;
  initial: AcceptAs;
  challenge: { id: number; name: string; list: { name: string; canAdd: boolean } | null };
  onClose: () => void;
}) {
  const [as, setAs] = useState<AcceptAs>(initial);
  const [addToList, setAddToList] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const title = proposal.game.title;
  const accept = () =>
    startTransition(async () => {
      const result = await acceptProposalAction(challenge.id, proposal.id, as, addToList);
      if (result.ok) onClose();
      else setError(result.error ?? result.refusal?.message ?? "That didn't save. Try again.");
    });
  return (
    <div className="flex flex-col gap-4">
      <DialogHeader>
        <DialogTitle>Accept {title}</DialogTitle>
        <DialogDescription>
          Proposed by {proposal.proposer.name} for {challenge.name}.
        </DialogDescription>
      </DialogHeader>
      <RadioGroup value={as} onValueChange={(v) => setAs(v as AcceptAs)} aria-label="Accept as" className="grid-cols-2 gap-2.5">
        {CHOICES.map((choice) => (
          <Label key={choice.value} variant="choice" className="flex cursor-pointer flex-col items-start px-3 py-2.5">
            <RadioGroupItem value={choice.value} variant="choice" className="sr-only" />
            <span className="font-headline text-[1.15rem] leading-none">{choice.name}</span>
            <span className="mt-1 text-[0.85rem] leading-[1.35] text-dim-foreground">{choice.line}</span>
          </Label>
        ))}
      </RadioGroup>
      {challenge.list?.canAdd && <AlsoAddSwitch listName={challenge.list.name} checked={addToList} onChange={setAddToList} />}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onClose} disabled={pending}>
          Cancel
        </Button>
        <Button type="button" variant="highlight" onClick={accept} disabled={pending}>
          {pending ? "Accepting" : as === "core" ? "Accept as Core" : "Accept as Optional"}
        </Button>
      </div>
    </div>
  );
}
