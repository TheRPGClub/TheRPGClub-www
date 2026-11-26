"use client";

import type { CSSProperties } from "react";
import { X } from "lucide-react";
import type { Feedback, FeedbackKind } from "@/lib/api/types";
import { kindMeta } from "@/lib/feedback";
import { changeFeedbackKindAction } from "@/app/actions/feedback-review";
import { useDeskAction } from "@/hooks/use-desk-action";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DeskApprove } from "./desk-approve";
import { DeskDuplicate } from "./desk-duplicate";
import { DeskFields } from "./desk-fields";
import type { DeskDecision } from "./desk-notice";
import { DeskReject } from "./desk-reject";
import { KindHeader } from "./kind-header";

export interface DeskSheetActions {
  onDecided: (decision: DeskDecision) => void;
  onGone: (id: number) => void;
}

// The review Sheet from the right (full width on phones): the inked header
// with the three-way kind switch, the Feedback's fields read-only, then
// Approve / Reject / Duplicate. A kind change saves at once and moves the
// card to its new lane.
export function DeskSheet({
  feedback,
  open,
  onClose,
  ...rest
}: {
  feedback: Feedback | null;
  open: boolean;
  onClose: () => void;
  onChanged: (f: Feedback) => void;
} & DeskSheetActions) {
  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      {/* Keyed so one Feedback's refusal doesn't show on the next one opened. */}
      {feedback && <DeskSheetBody key={feedback.feedback_id} feedback={feedback} onClose={onClose} {...rest} />}
    </Sheet>
  );
}

function DeskSheetBody({
  feedback,
  onClose,
  onChanged,
  onDecided,
  onGone,
}: {
  feedback: Feedback;
  onClose: () => void;
  onChanged: (f: Feedback) => void;
} & DeskSheetActions) {
  const kindAction = useDeskAction(() => onGone(feedback.feedback_id));

  function changeKind(kind: FeedbackKind) {
    if (kind === feedback.kind) return;
    kindAction.run(() => changeFeedbackKindAction(feedback.feedback_id, kind), onChanged);
  }

  return (
    <SheetContent
      side="right"
      showCloseButton={false}
      style={{ "--k": kindMeta(feedback.kind).ink } as CSSProperties}
      className="gap-0 overflow-y-auto p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-[440px]"
    >
      <KindHeader
        kind={feedback.kind}
        editing={false}
        eyebrow="Review"
        compact
        onKind={changeKind}
        disabled={kindAction.pending}
        end={
          <SheetClose render={<Button variant="inverse-ghost" size="icon-sm" className="self-start" />}>
            <X aria-hidden />
            <span className="sr-only">Close</span>
          </SheetClose>
        }
      />
      {kindAction.error && (
        <p role="alert" className="border-b border-border px-5 py-2.5 text-sm text-destructive">
          {kindAction.error}
        </p>
      )}
      <DeskFields feedback={feedback} />
      <Tabs defaultValue="approve" className="gap-0">
        <TabsList variant="desk" className="px-3">
          <TabsTrigger value="approve">Approve</TabsTrigger>
          <TabsTrigger value="reject">Reject</TabsTrigger>
          <TabsTrigger value="duplicate">Duplicate</TabsTrigger>
        </TabsList>
        {/* Keyed so a kind change resets Approve's repo and Reject's picks. */}
        <TabsContent value="approve" className="px-5 py-4">
          <DeskApprove key={feedback.kind} feedback={feedback} onClose={onClose} onDecided={onDecided} onGone={onGone} />
        </TabsContent>
        <TabsContent value="reject" className="px-5 py-4">
          <DeskReject key={feedback.kind} feedback={feedback} onClose={onClose} onDecided={onDecided} onGone={onGone} />
        </TabsContent>
        <TabsContent value="duplicate" className="px-5 py-4">
          <DeskDuplicate feedback={feedback} onClose={onClose} onDecided={onDecided} onGone={onGone} />
        </TabsContent>
      </Tabs>
    </SheetContent>
  );
}
