import { PART_NAME } from "@/lib/codex/paths";
import { PART_INK } from "@/lib/codex/see-also";
import type { CodexPart } from "@/lib/codex/types";
import { cn } from "@/lib/utils";

// A See also entry's part in its part ink (5D): "History Event", "Lore
// Entry" or "Fun Fact" in Barlow Condensed caps.
export function PartLabel({ part, className }: { part: CodexPart; className?: string }) {
  return (
    <b
      style={{ color: PART_INK[part] }}
      className={cn("font-label text-[0.72rem] leading-none font-bold tracking-[0.08em] whitespace-nowrap uppercase", className)}
    >
      {PART_NAME[part].one}
    </b>
  );
}
