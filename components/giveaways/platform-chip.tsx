import type { CSSProperties, ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// A platform chip in its ribbon ink, with ink type.
export function PlatformChip({ ink, children, className }: { ink: string; children: ReactNode; className?: string }) {
  return (
    <Badge
      tone="platform"
      className={cn("h-[22px] border-0 px-[7px] text-[0.74rem]", className)}
      style={{ "--platform-ink": ink } as CSSProperties}
    >
      {children}
    </Badge>
  );
}
