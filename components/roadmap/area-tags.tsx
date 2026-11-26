import { Badge } from "@/components/ui/badge";
import { AREA_TAG_LABEL, areaTags } from "@/lib/roadmap/tree";
import type { RoadmapArea } from "@/lib/roadmap/types";

// A Roadmap Item's area as separate tags: Bot (violet) and/or Web (yellow).
// "Both" is the two tags side by side, never a tag of its own.
export function AreaTags({ area }: { area: RoadmapArea | null }) {
  const tags = areaTags(area);
  if (tags.length === 0) return null;
  return (
    <span className="ml-auto flex shrink-0 gap-1 self-center">
      {tags.map((tag) => (
        <Badge key={tag} tone={`area-${tag}`} size="sm">
          {AREA_TAG_LABEL[tag]}
        </Badge>
      ))}
    </span>
  );
}
