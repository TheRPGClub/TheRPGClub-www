import { EyeOff, Lock } from "lucide-react";
import { Chip } from "@/components/challenges/challenge-banner";

// The pick page's header (surface brief challenges-santa-pick): the holly
// Edition chip and "Private", "Pick for Loot Hoarder" on the 2px rule, the
// days left to pick in holly at the right, then the privacy line and what
// the API knows of the recipient's taste.
export function PickHeader({
  chip,
  title,
  days,
  daysLabel,
  privacy,
  hints,
  badge,
}: {
  chip: string;
  title: string;
  days: number | null;
  daysLabel: string;
  privacy: string;
  hints: string[];
  badge?: React.ReactNode;
}) {
  return (
    <header data-slot="pick-header">
      <div className="flex flex-wrap items-end gap-x-4 gap-y-3 border-b-2 border-foreground pb-3">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-1.5">
            {badge}
            <Chip className="bg-(--challenge-tint) text-(--challenge-type)">{chip}</Chip>
            <Chip className="bg-foreground/8 text-dim-foreground">
              <Lock aria-hidden className="size-3" />
              Private
            </Chip>
          </div>
          <h1 className="font-headline text-[3rem] leading-[0.9] text-balance break-words sm:text-[4rem]">{title}</h1>
        </div>
        {days !== null && (
          <p className="ml-auto flex flex-col items-end text-right">
            <b className="font-headline text-[3.5rem] leading-[0.8] font-normal text-(--challenge-tint-hi) sm:text-[4.5rem]">
              {days}
            </b>
            <span className="font-label mt-1.5 text-[0.78rem] tracking-[0.08em] text-dim-foreground">{daysLabel}</span>
          </p>
        )}
      </div>
      <p className="mt-3 flex items-start gap-2 text-[0.9rem] leading-[1.45] text-dim-foreground">
        <EyeOff aria-hidden className="mt-0.5 size-4 shrink-0" />
        {privacy}
      </p>
      {hints.length > 0 && (
        <p className="mt-1.5 flex flex-col gap-y-0.5 pl-6 text-[0.9rem] leading-[1.45] text-dim-foreground sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-2">
          <span className="font-label text-[0.75rem] font-extrabold tracking-[0.1em] text-faint-foreground">
            To help you choose
          </span>
          {hints.map((hint, i) => (
            <span key={hint}>
              {i > 0 && (
                <span aria-hidden className="mr-2 text-faint-foreground max-sm:hidden">
                  ·
                </span>
              )}
              {hint}
            </span>
          ))}
        </p>
      )}
    </header>
  );
}
