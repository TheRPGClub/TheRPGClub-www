"use client";

import type { CSSProperties, ReactNode } from "react";
import type { FeedbackKind } from "@/lib/api/types";
import { FEEDBACK_KINDS, kindMeta } from "@/lib/feedback";
import { DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { KIND_ICON } from "./kind-icon";

// The Give feedback dialog's header, filled with the kind's ink in the
// page's ink type: the kind's big icon, "Give feedback" (or "Edit") over the
// kind's name in Anton and its one line. On the right the three-way kind
// switch recolours the whole card; it is gone when editing, since an author
// can't change the kind (staff can, on review). The review desk's Sheet
// (www#227) reuses it with its own eyebrow and its close button as `end`.
export function KindHeader({
  kind,
  editing,
  eyebrow,
  onKind,
  disabled,
  end,
  compact = false,
}: {
  kind: FeedbackKind;
  editing: boolean;
  // Overrides "Give feedback" / "Edit" over the kind's name.
  eyebrow?: string;
  onKind?: (kind: FeedbackKind) => void;
  disabled: boolean;
  // Trailing controls after the kind switch (the Sheet's close).
  end?: ReactNode;
  // The narrow Sheet: a smaller title, no blurb, the switch on its own row.
  compact?: boolean;
}) {
  const meta = kindMeta(kind);
  const Icon = KIND_ICON[kind];
  return (
    <header data-slot="feedback-kind-head" className="flex flex-wrap items-center gap-x-[18px] gap-y-4 bg-(--k) px-5 py-5 text-background sm:px-6">
      <Icon aria-hidden className={cn("size-11 shrink-0 stroke-[2.5]", compact ? "size-9" : "sm:size-14")} />
      <div className="min-w-0 flex-1">
        <DialogTitle variant="kind" className={compact ? "text-[2.1rem]" : "text-[2.4rem] sm:text-[3.2rem]"}>
          <span className="font-label block pb-1.5 text-[0.78rem] font-bold tracking-[0.08em]">
            {eyebrow ?? (editing ? "Edit" : "Give feedback")}
          </span>
          {meta.label}
        </DialogTitle>
        {!compact && <p className="mt-1 text-[0.95rem] leading-tight font-medium">{meta.blurb}</p>}
      </div>
      {onKind && (
        <RadioGroup
          aria-label="Kind"
          value={kind}
          disabled={disabled}
          onValueChange={(value) => onKind(value as FeedbackKind)}
          className={cn("flex w-full flex-wrap gap-1.5", compact ? "order-last" : "sm:w-auto sm:flex-col")}
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
      {end}
    </header>
  );
}
