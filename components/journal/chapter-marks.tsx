import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// The marks a chapter carries from the member's lists.
export function ChapterMarks({
  nowPlaying,
  completed,
  className,
}: {
  nowPlaying?: boolean;
  completed?: boolean;
  className?: string;
}) {
  if (!nowPlaying && !completed) return null;
  return (
    <>
      {nowPlaying && <Badge className={cn("border-0", className)}>Now Playing</Badge>}
      {completed && (
        <Badge tone="rarity-uncommon" className={cn("border-0", className)}>Game Completion</Badge>
      )}
    </>
  );
}
