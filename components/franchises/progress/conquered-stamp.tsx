import { cn } from "@/lib/utils";

// The Conquered stamp (pick 1E): paper ink on ink, a double edge, pressed
// at a tilt with the stamp shadow (the Hand-Placed Rule). Never foil
// (achievements only) and never a starburst (winners only). `sm` is the
// Members table's, tilted less.
export function ConqueredStamp({ date, size = "md", className }: { date?: string; size?: "md" | "sm"; className?: string }) {
  const sm = size === "sm";
  return (
    <span
      className={cn(
        "inline-flex flex-col items-center gap-0.5 rounded-xs bg-background text-foreground outline-1 outline-foreground drop-shadow-[0_6px_14px_rgb(0_0_0/0.45)]",
        sm
          ? "-rotate-4 border-2 border-foreground px-[7px] pt-[3px] pb-[2px] outline-offset-[1.5px]"
          : "-rotate-8 border-[2.5px] border-foreground px-3 pt-1.5 pb-[5px] outline-offset-2",
        className,
      )}
    >
      <b className={cn("font-headline leading-[0.9] font-normal tracking-[0.02em]", sm ? "text-[0.95rem]" : "text-[1.45rem]")}>
        Conquered
      </b>
      {date && (
        <small className="font-label text-[0.66rem] leading-none font-extrabold tracking-[0.08em]">{date}</small>
      )}
    </span>
  );
}
