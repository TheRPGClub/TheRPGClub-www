"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

// The field at the top of an open + Add slot. Esc closes the slot.
export function SlotSearchField({
  value,
  onChange,
  onClose,
  label,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  label: string;
  placeholder: string;
}) {
  return (
    <div className="relative">
      <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-faint-foreground" />
      <Input
        type="search"
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.preventDefault();
            onClose();
          }
        }}
        placeholder={placeholder}
        aria-label={label}
        className="h-11 pr-14 pl-9"
      />
      <kbd className="font-label pointer-events-none absolute top-1/2 right-3 hidden -translate-y-1/2 rounded-xs border border-border-strong px-1.5 py-0.5 text-[0.68rem] font-bold tracking-[0.06em] text-faint-foreground sm:block">
        Esc
      </kbd>
    </div>
  );
}
