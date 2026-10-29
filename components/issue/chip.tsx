import { cn } from "@/lib/utils";

// A fact chip (year, platform, studio) in the label voice. Tracks colour
// their own chips; everything else stays paper on ink.
const TONE = {
  neutral: "bg-paper/8 text-paper-dim",
  gotm: "bg-gotm text-white",
  nr_gotm: "bg-nr text-white",
  highlight: "bg-highlight text-ink",
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
