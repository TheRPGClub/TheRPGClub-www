import type { AchievementProvider } from "@/lib/api/types";
import { PROVIDER_LABEL, PROVIDER_SHORT_LABEL } from "@/lib/achievements";
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
  className,
}: {
  provider: AchievementProvider;
  // "RA" / "Steam" / "PSN", for tight rows.
  short?: boolean;
  className?: string;
}) {
  return (
    <span
      title={short ? PROVIDER_LABEL[provider] : undefined}
      className={cn(
        "font-label inline-flex h-6 items-center rounded-xs px-2 text-[0.78rem] whitespace-nowrap text-ink",
        PROVIDER_FILL[provider],
        className,
      )}
    >
      {short ? PROVIDER_SHORT_LABEL[provider] : PROVIDER_LABEL[provider]}
    </span>
  );
}
