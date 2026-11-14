import { cn } from "@/lib/utils";

// A fact chip (year, platform, studio) in the label voice. Tracks colour
// their own chips; everything else stays paper on ink.
const TONE = {
  neutral: "bg-foreground/8 text-dim-foreground",
  gotm: "bg-gotm text-gotm-foreground",
  nr_gotm: "bg-nr text-nr-foreground",
  highlight: "bg-highlight text-highlight-foreground",
} as const;

export type ChipTone = keyof typeof TONE;

export function Chip({
  tone = "neutral",
  className,
  children,
}: {
  tone?: ChipTone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "font-label inline-flex h-6 items-center gap-1 rounded-xs px-2 text-[0.78rem] whitespace-nowrap [&_svg]:size-3",
        TONE[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
