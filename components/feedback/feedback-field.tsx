import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";

// The Give feedback form's field frame: a label in the label voice over
// the field, and a hint line with the field's count on its right.

// On a Label the Theme gives the ink: pass the type alone.
export const FIELD_LABEL_TYPE = "font-label block text-[0.82rem]";
export const FIELD_LABEL = `${FIELD_LABEL_TYPE} text-faint-foreground`;
export const FIELD_HINT = "mt-1.5 flex justify-between gap-4 text-[0.85rem] text-faint-foreground";

export function FeedbackField({
  id,
  label,
  hint,
  length,
  max,
  children,
}: {
  id: string;
  label: string;
  hint: string;
  length: number;
  max: number;
  children: ReactNode;
}) {
  return (
    <div className="mb-5.5">
      <Label htmlFor={id} variant="field" className={FIELD_LABEL_TYPE}>
        {label}
      </Label>
      {children}
      <p id={`${id}-hint`} className={FIELD_HINT}>
        <span>{hint}</span>
        <span className="tabular-nums">
          {length} / {max}
        </span>
      </p>
    </div>
  );
}
