import { useId } from "react";
import { GOTY_DATE_LABEL, type GotyDateKey } from "@/lib/goty-desk";
import { CLUB_TIME_ZONE, localInputToOffsetIso, toLocalInputValue } from "@/lib/public-reminders";
import { dayAndClock } from "@/lib/voting-console";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// One of the GOTY Vote's dates: a datetime field in the viewer's zone, with
// the club's clock under it (the moved one in yellow).
export function GotyDateField({
  field,
  at,
  saved,
  disabled,
  isClient,
  onChange,
}: {
  field: GotyDateKey;
  at: number;
  saved: number;
  disabled: boolean;
  isClient: boolean;
  onChange: (at: number) => void;
}) {
  const id = useId();
  const moved = at !== saved;
  return (
    <div>
      <Label htmlFor={id} variant="field" className="mb-1 block text-[0.8rem]">
        {GOTY_DATE_LABEL[field]}
      </Label>
      <Input
        id={id}
        type="datetime-local"
        variant="inset"
        disabled={disabled}
        aria-describedby={`${id}-club`}
        value={isClient && !Number.isNaN(at) ? toLocalInputValue(new Date(at).toISOString()) : ""}
        onChange={(e) => {
          const iso = localInputToOffsetIso(e.target.value);
          onChange(iso ? Date.parse(iso) : NaN);
        }}
      />
      <p id={`${id}-club`} className={moved ? "mt-1 text-[0.78rem] text-highlight" : "mt-1 text-[0.78rem] text-faint-foreground"}>
        {isClient && !Number.isNaN(at) ? `${dayAndClock(at, CLUB_TIME_ZONE)} club time` : " "}
      </p>
    </div>
  );
}
