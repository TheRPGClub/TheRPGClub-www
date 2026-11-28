import type { AchievementProvider } from "@/lib/api/types";
import { PROVIDER_LABEL, PROVIDER_SHORT_LABEL } from "@/lib/achievements";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// A Provider as a solid chip in its own colour with ink type. Provider
// colours live on achievement surfaces only (chips, filter tabs, a 3px rule
// on cards); see PROVIDER_FILL for the matching class elsewhere.
export const PROVIDER_FILL: Record<AchievementProvider, string> = {
  retroachievements: "bg-provider-retroachievements",
  steam: "bg-provider-steam",
  psn: "bg-provider-psn",
};

export function ProviderBadge({
  provider,
  short = false,
  name,
  className,
}: {
  provider: AchievementProvider;
  // "RA" / "Steam" / "PSN", for tight rows.
  short?: boolean;
  // The member's name on the Provider, set inside the chip after the label
  // in Barlow (a Linked Account chip).
  name?: string | null;
  className?: string;
}) {
  return (
    <Badge
      title={short ? PROVIDER_LABEL[provider] : undefined}
      tone={`provider-${provider}`}
      className={cn("gap-0 border-0", className)}
    >
      {short ? PROVIDER_SHORT_LABEL[provider] : PROVIDER_LABEL[provider]}
      {name && (
        <span data-slot="provider-badge-name" className="ml-1.5 min-w-0 truncate font-sans text-[0.85rem] font-semibold tracking-normal normal-case">
          {name}
        </span>
      )}
    </Badge>
  );
}
