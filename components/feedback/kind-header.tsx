"use client";

import type { CSSProperties } from "react";
import type { FeedbackKind } from "@/lib/api/types";
import { FEEDBACK_KINDS, kindMeta } from "@/lib/feedback";
import { DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { KIND_ICON } from "./kind-icon";

// The Give feedback dialog's header, filled with the kind's ink in the
// page's ink type: the kind's big icon, "Give feedback" (or "Edit") over the
// kind's name in Anton and its one line. On the right the three-way kind
// switch recolours the whole card; it is gone when editing, since an author
// can't change the kind (staff can, on review).
export function KindHeader({
  kind,
  editing,
  onKind,
  disabled,
}: {
  kind: FeedbackKind;
  editing: boolean;
  onKind?: (kind: FeedbackKind) => void;
  disabled: boolean;
}) {
  const meta = kindMeta(kind);
  const Icon = KIND_ICON[kind];
  return (
    <header className="flex flex-wrap items-center gap-x-[18px] gap-y-4 bg-(--k) px-5 py-5 text-background sm:px-6">
      <Icon aria-hidden className="size-11 shrink-0 stroke-[2.5] sm:size-14" />
      <div className="min-w-0 flex-1">
        <DialogTitle variant="kind" className="text-[2.4rem] sm:text-[3.2rem]">
          <span className="font-label block pb-1.5 text-[0.78rem] font-bold tracking-[0.08em]">
            {editing ? "Edit" : "Give feedback"}
          </span>
          {meta.label}
        </DialogTitle>
        <p className="mt-1 text-[0.95rem] leading-tight font-medium">{meta.blurb}</p>
      </div>
      {onKind && (
        <RadioGroup
          aria-label="Kind"
          value={kind}
          disabled={disabled}
          onValueChange={(value) => onKind(value as FeedbackKind)}
          className="flex w-full flex-wrap gap-1.5 sm:w-auto sm:flex-col"
        >
          {FEEDBACK_KINDS.map((k) => {
            const KindIcon = KIND_ICON[k.value];
            return (
              <Label
                key={k.value}
                variant="kind-switch"
                style={{ "--k": k.ink } as CSSProperties}
                className="relative flex items-center gap-2 px-2.5 py-1.5 text-[0.8rem]"
              >
                <RadioGroupItem value={k.value} className="sr-only" />
                <KindIcon aria-hidden className="size-4 shrink-0" />
                {k.label}
              </Label>
            );
          })}
        </RadioGroup>
      )}
    </header>
  );
}
