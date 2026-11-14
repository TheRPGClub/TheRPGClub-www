"use client";

import { clockReading } from "@/lib/live-events";
import { useIsClient } from "@/hooks/use-is-client";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// The form's field label: tracked condensed caps over the field.
export const LIVE_EVENT_LABEL = "font-label block text-[0.82rem] tracking-[0.06em] text-faint-foreground";

// A start or end as a big clock in the viewer's zone, the day (and the
// event's length on the end), club time under it, and the plain field.
export function LiveEventClock({
  id,
  label,
  value,
  onChange,
  iso,
  duration,
  disabled,
  second,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  iso: string | null;
  duration?: string | null;
  disabled: boolean;
  second?: boolean;
}) {
  const isClient = useIsClient();
  const reading = isClient && iso ? clockReading(iso) : null;
  return (
    <div className={cn("min-w-0 border-b border-border py-3.5 md:pr-4", second && "md:border-l md:pl-4")}>
      <label htmlFor={id} className={LIVE_EVENT_LABEL}>
        {label}
      </label>
      <p aria-hidden className="font-headline mt-1 text-[2.6rem] leading-[0.9]">
        {reading?.time ?? "--:--"}
      </p>
      <p className="mt-1 font-semibold">
        {reading ? (
          <>
            {reading.day}
            {duration ? ` · ${duration}` : ""}
          </>
        ) : (
          <span className="text-faint-foreground">Pick a day and time</span>
        )}
      </p>
      <p className="mt-0.5 text-[0.85rem] text-dim-foreground">
        Club time <b className="font-semibold text-foreground">{reading?.club ?? "--"}</b>
      </p>
      <Input
        id={id}
        type="datetime-local"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        disabled={disabled}
        className="mt-2.5"
      />
    </div>
  );
}
