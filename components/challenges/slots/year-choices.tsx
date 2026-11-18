"use client";

import { Button } from "@/components/ui/button";

// The open years a game can go to, one button each ("Move it to 2003").
export function YearChoices({
  label,
  years,
  pending,
  empty,
  onPick,
}: {
  label: string;
  years: number[];
  pending: boolean;
  // Said when no year fits.
  empty: string;
  onPick: (year: number) => void;
}) {
  if (years.length === 0) return <p className="text-sm text-dim-foreground">{empty}</p>;
  return (
    <div role="group" aria-label={label} className="space-y-2">
      <p className="font-label text-[0.8rem] tracking-[0.08em] text-faint-foreground">{label}</p>
      <div className="flex flex-wrap gap-2">
        {years.map((year) => (
          <Button
            key={year}
            type="button"
            variant="outline"
            size="sm"
            disabled={pending}
            aria-label={`${label} ${year}`}
            onClick={() => onPick(year)}
          >
            {year}
          </Button>
        ))}
      </div>
    </div>
  );
}
