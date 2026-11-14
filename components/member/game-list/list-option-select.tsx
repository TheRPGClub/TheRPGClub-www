"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface ListOption<T> {
  value: T;
  label: string;
}

// One of the options a game is added to a list with (its platform, how it
// was completed, how it is owned), as a full-width Select.
export function ListOptionSelect<T extends string | number | null>({
  label,
  items,
  value,
  onValueChange,
}: {
  // The field's name to a screen reader.
  label: string;
  items: ListOption<T>[];
  value: T;
  onValueChange: (value: T) => void;
}) {
  return (
    <Select items={items} value={value} onValueChange={(next) => onValueChange(next as T)}>
      <SelectTrigger aria-label={label} className="w-full min-w-0 data-[size=default]:h-9">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={String(item.value)} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
