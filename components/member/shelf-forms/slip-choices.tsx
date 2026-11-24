"use client";

import type { LucideIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

export interface SlipChoice {
  value: string;
  label: string;
  // A short line saying what it means ("The credits rolled.").
  hint?: string;
  icon?: LucideIcon;
}

// One of a few choices on the slip as ink boxes (how far a Game Completion
// got, how a game is owned): a radio group, the picked box filled with ink.
export function SlipChoices({
  label,
  choices,
  value,
  onValueChange,
  className,
}: {
  label: string;
  choices: readonly SlipChoice[];
  value: string;
  onValueChange: (value: string) => void;
  // Placement and the grid's columns.
  className?: string;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <span className="font-label text-[0.75rem] leading-none font-extrabold tracking-[0.08em] text-background/72 uppercase">
        {label}
      </span>
      <RadioGroup
        aria-label={label}
        value={value}
        onValueChange={(next) => onValueChange(String(next))}
        className={cn("grid gap-1.5", className)}
      >
        {choices.map((choice) => {
          const Icon = choice.icon;
          return (
            <Label key={choice.value} variant="slip-choice" className="flex min-w-0 flex-col gap-1 px-2.5 py-2">
              <span className="flex items-center gap-2">
                <RadioGroupItem value={choice.value} variant="slip" className="size-3.5" />
                <span className="text-[0.82rem] leading-[1.05] font-extrabold tracking-[0.05em] uppercase">
                  {choice.label}
                </span>
                {Icon && <Icon aria-hidden className="ml-auto size-3.5 shrink-0 opacity-60 max-sm:hidden" />}
              </span>
              {choice.hint && (
                <span className="hidden font-sans text-[0.78rem] leading-snug font-normal tracking-normal normal-case opacity-70 sm:block">
                  {choice.hint}
                </span>
              )}
            </Label>
          );
        })}
      </RadioGroup>
    </div>
  );
}
