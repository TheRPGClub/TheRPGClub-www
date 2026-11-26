"use client";

import type { FeedbackForm } from "@/hooks/use-feedback-form";
import { FEEDBACK_DETAILS_MAX, FEEDBACK_WHERES, type FeedbackWhere } from "@/lib/feedback";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { FormRow } from "./form-row";

const TEXTS = [
  { name: "what_happened", label: "What happened", rows: 3, optional: false, placeholder: "" },
  { name: "expected", label: "What you expected", rows: 2, optional: false, placeholder: "" },
  { name: "steps", label: "Steps to reproduce", rows: 3, optional: true, placeholder: "1. …  2. …" },
] as const;

// A Bug Report's own rows: Where (Bot or Website, filled in the ink when
// chosen), What happened, What you expected and the optional Steps.
export function BugFields({ form }: { form: FeedbackForm }) {
  const { fields, set, pending } = form;
  return (
    <>
      <FormRow id="feedback-where" label="Where" group>
        <RadioGroup
          aria-labelledby="feedback-where-label"
          value={fields.where}
          disabled={pending}
          onValueChange={(value) => set("where", value as FeedbackWhere)}
          className="flex flex-wrap gap-2"
        >
          {FEEDBACK_WHERES.map((w) => (
            <Label key={w.value} variant="kind-choice" className="relative px-6 py-2.5 text-[0.85rem]">
              <RadioGroupItem value={w.value} className="sr-only" />
              {w.label}
            </Label>
          ))}
        </RadioGroup>
      </FormRow>
      {TEXTS.map((t) => (
        <FormRow key={t.name} id={`feedback-${t.name}`} label={t.label} optional={t.optional}>
          <Textarea
            id={`feedback-${t.name}`}
            variant="kind"
            value={fields[t.name]}
            onChange={(e) => set(t.name, e.target.value)}
            maxLength={FEEDBACK_DETAILS_MAX}
            rows={t.rows}
            placeholder={t.placeholder || undefined}
            required={!t.optional}
            disabled={pending}
            className="min-h-0 px-3 py-2 text-[0.95rem] md:text-[0.95rem]"
          />
        </FormRow>
      ))}
    </>
  );
}
