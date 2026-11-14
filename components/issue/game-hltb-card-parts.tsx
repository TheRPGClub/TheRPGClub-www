import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

// The "Time to beat" card's shared pieces: a bar on the shared scale, the
// card's foot and a link out to HowLongToBeat.

export const labelClass =
  "font-label text-[0.8rem] font-bold tracking-[0.06em] text-faint-foreground uppercase";

export function Bar({
  label,
  figure,
  unit,
  percent,
  placeholder,
}: {
  label: string;
  figure: string;
  unit: string;
  percent: number;
  placeholder?: boolean;
}) {
  return (
    <li className="grid h-7.5 grid-cols-[6.875rem_1fr_2.875rem] items-center gap-2.5">
      <span className="font-label text-[0.85rem] font-bold tracking-[0.06em] text-dim-foreground uppercase">
        {label}
      </span>
      <span aria-hidden className="relative h-2.5 rounded-[1px] bg-muted">
        <i
          className={cn(
            "absolute inset-y-0 left-0 rounded-[1px]",
            placeholder ? "bg-border-strong" : "bg-foreground",
          )}
          style={{ width: `${percent}%` }}
        />
      </span>
      <span className="text-right font-headline text-[1.35rem] leading-none">
        {figure}
        {unit && <small className="text-[0.8rem] text-dim-foreground normal-case">{unit}</small>}
      </span>
    </li>
  );
}

export function Foot({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "mt-2.5 flex justify-between gap-3 border-t border-border pt-2.5",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SourceLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        labelClass,
        "inline-flex items-center gap-1 text-dim-foreground underline-offset-4 hover:text-foreground hover:underline",
      )}
    >
      {children}
      <ArrowUpRight aria-hidden className="size-3.25" />
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}
