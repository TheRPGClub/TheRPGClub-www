import { cn } from "@/lib/utils";

// A line pencilled on the board in the desk's yellow, underlined by hand:
// "Draft · only you can see it" above a Draft's sheet. The sheet positions
// it (it is `relative`).
export function PencilNote({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("absolute -top-8 left-3.5 z-10 m-0", className)}>
      <span className="relative text-[0.9rem] leading-tight font-semibold text-highlight italic">
        {children}
        <PencilUnderline />
      </span>
    </p>
  );
}

function PencilUnderline() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 100 8"
      preserveAspectRatio="none"
      className="pointer-events-none absolute -right-1.5 -bottom-1.5 -left-1 h-2 w-[calc(100%+10px)] overflow-visible text-highlight"
    >
      <path
        d="M1 5 C 20 2, 45 7, 70 4 S 95 3, 99 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
