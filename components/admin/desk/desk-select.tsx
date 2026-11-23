"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface DeskOption {
  // "" is the field's empty choice ("Doesn't repeat", "No platform").
  value: string;
  label: string;
}

export interface DeskOptionGroup {
  // Printed over the group's options; none for a plain list.
  label?: string;
  options: DeskOption[];
}

// An empty choice needs a value of its own: an empty one reads as no value
// at all, which the Theme greys as a prompt.
const NONE = "__none__";
const toSelect = (value: string) => (value === "" ? NONE : value);

// A staff form's select at field height: one list, or options in labelled
// groups. With `placeholder` an empty value is a prompt ("Pick a channel...");
// without it, "" is one of the options. The label sits outside: tie it with
// `labelledBy`.
export function DeskSelect({
  groups,
  value,
  onValueChange,
  placeholder,
  label,
  labelledBy,
  describedBy,
  invalid,
  disabled,
  required,
  onBlur,
}: {
  groups: DeskOptionGroup[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  // Names the select for assistive tech when no visible label points at it.
  label?: string;
  labelledBy?: string;
  describedBy?: string;
  invalid?: boolean;
  disabled?: boolean;
  required?: boolean;
  onBlur?: () => void;
}) {
  const options = groups.flatMap((g) => g.options);
  const items = Object.fromEntries(
    options.map((o) => [toSelect(o.value), o.label]),
  );
  const empty = value === "" && placeholder !== undefined;
  // Wrapped: the Select's hidden input is a sibling of its trigger, and
  // would take a stack's spacing.
  return (
    <div>
      <Select
        items={items}
        value={empty ? null : toSelect(value)}
        onValueChange={(next) =>
          onValueChange(next == null || next === NONE ? "" : String(next))
        }
        disabled={disabled}
        required={required}
      >
        <SelectTrigger
          aria-label={label}
          aria-labelledby={labelledBy}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          onBlur={onBlur}
          className="w-full min-w-0 data-[size=default]:h-9"
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {groups.map((group, i) =>
            group.label ? (
              <SelectGroup key={group.label}>
                <SelectLabel>{group.label}</SelectLabel>
                {group.options.map((o) => (
                  <SelectItem key={o.value} value={toSelect(o.value)}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            ) : (
              group.options.map((o) => (
                <SelectItem key={`${i}-${o.value}`} value={toSelect(o.value)}>
                  {o.label}
                </SelectItem>
              ))
            ),
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
