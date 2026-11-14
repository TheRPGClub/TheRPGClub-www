import type { ReactNode } from "react";

// The Suggest something form's field frame: a label in the label voice over
// the field, and a hint line with the field's count on its right.

export const FIELD_LABEL = "font-label block text-[0.82rem] text-faint-foreground";
export const FIELD_HINT = "mt-1.5 flex justify-between gap-4 text-[0.85rem] text-faint-foreground";

export function SuggestionField({
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
      <label htmlFor={id} className={FIELD_LABEL}>
        {label}
      </label>
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
