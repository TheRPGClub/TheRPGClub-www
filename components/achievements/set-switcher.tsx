"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

// Picks one of a Provider's sets on the game page (the PS4 and PS5 lists):
// one segment per set, the shown one pressed.
export function SetSwitcher({
  label,
  sets,
  value,
  onChange,
}: {
  // Names the group for assistive tech, e.g. "PlayStation sets".
  label: string;
  sets: { id: number; label: string }[];
  value: number;
  onChange: (id: number) => void;
}) {
  return (
    <ToggleGroup
      aria-label={label}
      variant="switcher"
      spacing={0.5}
      value={[String(value)]}
      onValueChange={(next) => {
        // Pressing the shown set again keeps it shown.
        const id = Number(next[0]);
        if (next.length > 0 && id !== value) onChange(id);
      }}
      className="mb-1.5 items-stretch"
    >
      {sets.map((set) => (
        <ToggleGroupItem
          key={set.id}
          value={String(set.id)}
          className="h-7.5 min-w-0 px-2.5 text-[0.88rem]"
        >
          {set.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
