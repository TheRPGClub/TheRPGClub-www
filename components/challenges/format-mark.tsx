import { FORMAT_NAME } from "@/lib/challenges/board";
import type { ChallengeFormat } from "@/lib/challenges/types";
import { cn } from "@/lib/utils";

// A Format ink's one job (DESIGN.md, Challenges inks): the 9px square beside
// the Format's name. It never colours a card, a bar or a heading.
const SQUARE: Record<ChallengeFormat, string> = {
  slots: "bg-format-slots",
  pool: "bg-format-pool",
  assignment: "bg-format-assignment",
};

export function FormatSquare({ format, className }: { format: ChallengeFormat; className?: string }) {
  return (
    <i aria-hidden className={cn("inline-block size-[9px] shrink-0 rounded-[1.5px]", SQUARE[format], className)} />
  );
}

// "■ Pool · Season 22 Sep – 20 Dec" as an ink label on a flyer, billboard
// or banner.
export function FormatLabel({
  format,
  when,
  className,
}: {
  format: ChallengeFormat;
  when?: string;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "font-label inline-flex max-w-full items-center gap-[7px] rounded-xs bg-background whitespace-nowrap px-2 pt-[5px] pb-1 text-[0.8rem] leading-none font-extrabold tracking-[0.1em] text-foreground",
        className,
      )}
    >
      <FormatSquare format={format} />
      {FORMAT_NAME[format]}
      {when && <span className="truncate">· {when}</span>}
    </p>
  );
}
