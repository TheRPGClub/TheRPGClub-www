import type { Platform } from "@/lib/api/types";
import { cn } from "@/lib/utils";

// PlatformResource sends the short form as `platform_abbreviation`, but it is
// nullable and older rows have none, so fall back through the code ("PS5",
// "SWITCH") to the full name. A badge has room for the short form only.
function platformLabel(platform: Platform): string {
  return (
    platform.platform_abbreviation ?? platform.platform_code ?? platform.platform_name
  );
}

export interface PlatformPillsProps {
  // Undefined wherever the API hasn't been asked to embed platforms, so this
  // renders nothing rather than a gap.
  platforms: Platform[] | undefined;
  // Beyond this, the rest collapse into a "+N" pill. Cards are narrow and a
  // game can be on eight platforms; the count still says there are more.
  max?: number;
  className?: string;
}

// Deliberately neutral rather than accent-coloured: these sit on cards whose
// hue already means something (the category, the winner, the viewer's own
// nomination), and platforms are metadata, not another signal. Same treatment
// as the year badge they sit near.
export function PlatformPills({
  platforms,
  max = 3,
  className,
}: PlatformPillsProps) {
  if (!platforms?.length) return null;

  const shown = platforms.slice(0, max);
  const hidden = platforms.length - shown.length;
  const pill =
    "inline-flex items-center rounded-md bg-muted/50 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground";

  return (
    <ul className={cn("flex flex-wrap items-center gap-1", className)}>
      {shown.map((platform) => (
        <li key={platform.platform_id} className={pill}>
          {platformLabel(platform)}
        </li>
      ))}
      {hidden > 0 && (
        <li
          className={pill}
          // The visible pills already name themselves; this one needs to say
          // what it stands for.
          title={platforms
            .slice(max)
            .map((platform) => platform.platform_name)
            .join(", ")}
        >
          +{hidden}
        </li>
      )}
    </ul>
  );
}
