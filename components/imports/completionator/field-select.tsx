"use client";

import { useId, type ReactNode } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// The tracked-caps name over each of the completion's fields.
export const FIELD_LABEL = "font-label font-extrabold tracking-[0.06em] text-dim-foreground";

// A named Select of string options, field height, with an optional note
// under it.
export function FieldSelect({
  label,
  items,
  value,
  onChange,
  children,
}: {
  label: string;
  items: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  children?: ReactNode;
}) {
  const id = useId();
  return (
    <div className="space-y-1.5 text-sm">
      <span id={id} className={FIELD_LABEL}>
        {label}
      </span>
      {/* One box for the trigger and the Select's hidden input, so the
          stack's spacing sees one field. */}
      <div>
        <Select items={items} value={value} onValueChange={(next) => onChange(next as string)}>
          <SelectTrigger aria-labelledby={id} className="w-full data-[size=default]:h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {items.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {children}
    </div>
  );
}
