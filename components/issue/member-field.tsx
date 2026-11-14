import { useId, type ReactNode } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// Form fields in the member pages' voice: a tracked-caps label over an ink
// control.

// The member pages' text field. Left for the compare page's search box until
// it moves to the shadcn Input (www#93).
export const memberControlClass =
  "h-9.5 w-full min-w-0 rounded-sm border border-border-strong bg-card px-2.5 text-sm text-foreground caret-highlight [color-scheme:dark] outline-none transition-colors placeholder:text-faint-foreground hover:border-faint-foreground focus-visible:border-faint-foreground focus-visible:ring-2 focus-visible:ring-highlight/40";

const frameClass = "flex min-w-0 flex-col gap-1.5";

function FieldLabel({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <span
      id={id}
      className="font-label text-[0.78rem] font-extrabold tracking-[0.1em] text-faint-foreground"
    >
      {children}
    </span>
  );
}

// A labelled text field: the label wraps its control.
export function MemberField({
  label,
  className,
  children,
}: {
  label: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={cn(frameClass, className)}>
      <FieldLabel>{label}</FieldLabel>
      {children}
    </label>
  );
}

export interface MemberSelectItem {
  value: string;
  label: string;
  disabled?: boolean;
}

// A labelled select. Its list holds the empty value as a choice ("Any
// year", "Pick a member…"), which reads like any other. Submits under `name`
// with the form.
export function MemberSelect({
  label,
  className,
  name,
  defaultValue,
  required,
  items,
}: {
  label: ReactNode;
  className?: string;
  name: string;
  defaultValue: string;
  required?: boolean;
  items: MemberSelectItem[];
}) {
  const labelId = useId();
  // Like a native select, a value with no item falls back to the first one.
  const initial = items.some((item) => item.value === defaultValue)
    ? defaultValue
    : (items.find((item) => !item.disabled)?.value ?? "");
  return (
    <div className={cn(frameClass, className)}>
      <FieldLabel id={labelId}>{label}</FieldLabel>
      <Select
        name={name}
        defaultValue={initial}
        required={required}
        items={items}
      >
        <SelectTrigger
          variant="clearable"
          aria-labelledby={labelId}
          className="w-full min-w-0 pr-2.25 data-[size=default]:h-9.5"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem
              key={item.value}
              value={item.value}
              disabled={item.disabled}
            >
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
