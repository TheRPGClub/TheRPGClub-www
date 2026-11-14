import { cn } from "@/lib/utils";

// The room every /join slide gets: under the masthead, clear of the ticks,
// and (from lg) clear of the pinned join panel on the right.

export function SlideFrame({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex h-full flex-col px-4 pt-18 pb-24 sm:px-10 sm:pt-24 lg:pt-36 lg:pr-[41rem] lg:pb-32",
        className,
      )}
    >
      {children}
    </div>
  );
}

// A two-line headline that steps down as its longer line lengthens, so a
// long title keeps to two or three lines beside the panel.
export function headlineSize(lines: readonly string[]): string {
  const longest = Math.max(...lines.map((line) => line.length));
  if (longest > 22) return "text-[2.5rem] sm:text-[3.5rem] lg:text-[clamp(3rem,4vw,4.25rem)]";
  if (longest > 15) return "text-[2.75rem] sm:text-[4rem] lg:text-[clamp(3.5rem,4.8vw,5.25rem)]";
  return "text-[3rem] sm:text-[4.5rem] lg:text-[clamp(4rem,5.6vw,6rem)]";
}
