"use client";

import type { CSSProperties } from "react";
import { Check } from "lucide-react";
import type { FeedbackKind } from "@/lib/api/types";
import { FEEDBACK_KINDS } from "@/lib/feedback";
import { Toggle } from "@/components/ui/toggle";
import { FIELD_HINT, FIELD_LABEL } from "./feedback-field";
import { KIND_ICON } from "./kind-icon";

// Interim (www#226 remakes the form): the kinds this form files, each a tag
// in its own ink, filled when picked. Bug Reports need their own fields, so
// until then they are filed with /feedback in Discord.
const FORM_KINDS = FEEDBACK_KINDS.filter((k) => k.value !== "bug_report");

export function FeedbackKindPicker({
  kind,
  onPick,
  disabled,
}: {
  kind: FeedbackKind | null;
  onPick: (kind: FeedbackKind) => void;
  disabled: boolean;
}) {
  return (
    <fieldset className="mb-5.5" aria-describedby="feedback-kind-hint">
      <legend className={FIELD_LABEL}>Kind</legend>
      <div className="mt-1.5 flex flex-wrap gap-2">
        {FORM_KINDS.map((k) => {
          const on = kind === k.value;
          const Icon = on ? Check : KIND_ICON[k.value];
          return (
            <Toggle
              key={k.value}
              variant="tag"
              pressed={on}
              onPressedChange={() => onPick(k.value)}
              title={k.blurb}
              disabled={disabled}
              style={{ "--tag-ink": k.ink } as CSSProperties}
              className="h-8 gap-1.5 px-3 text-[0.85rem]"
            >
              <Icon aria-hidden className="size-3.5" />
              {k.label}
            </Toggle>
          );
        })}
      </div>
      <p id="feedback-kind-hint" className={FIELD_HINT}>
        <span>Found a bug? File a Bug Report with /feedback in Discord for now.</span>
      </p>
    </fieldset>
  );
}
