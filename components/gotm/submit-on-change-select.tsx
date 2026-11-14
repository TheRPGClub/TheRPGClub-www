"use client";

import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// A select that submits its form as soon as it changes, for filters where
// a separate Apply step is friction (the archive's sort). It sits beside a
// page's search bar and wears its look.
export function SubmitOnChangeSelect({
  name,
  defaultValue,
  options,
  "aria-label": ariaLabel,
  className,
}: {
  name: string;
  defaultValue: string;
  options: { value: string; label: string }[];
  "aria-label": string;
  className?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const input = useRef<HTMLInputElement>(null);
  const items = Object.fromEntries(options.map((o) => [o.value, o.label]));

  return (
    <Select
      name={name}
      items={items}
      value={value}
      inputRef={input}
      onValueChange={(next) => {
        if (next === null) return;
        // Write the new value into the form's field before submitting it.
        flushSync(() => setValue(next));
        input.current?.form?.requestSubmit();
      }}
    >
      <SelectTrigger variant="search" aria-label={ariaLabel} className={className}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
