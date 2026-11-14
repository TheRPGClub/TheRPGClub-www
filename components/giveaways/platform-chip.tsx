import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// A platform chip in its ribbon ink, with ink type.
export function PlatformChip({ ink, children, className }: { ink: string; children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "font-label inline-flex h-[22px] items-center rounded-xs px-[7px] text-[0.74rem] font-extrabold whitespace-nowrap text-background",
        className,
      )}
      style={{ background: ink }}
    >
      {children}
    </span>
  );
}
