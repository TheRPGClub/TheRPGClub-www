import type { AchievementProvider } from "@/lib/api/types";
import { PROVIDER_LABEL, PROVIDER_SHORT_LABEL } from "@/lib/achievements";
import { Chip } from "@/components/issue/chip";

// A Provider as a neutral fact chip. Provider brand colours stay off the
// page: red, violet and yellow already mean GOTM, NR-GOTM and "yours".
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
    <Chip className={className}>
      <span title={short ? PROVIDER_LABEL[provider] : undefined}>
        {short ? PROVIDER_SHORT_LABEL[provider] : PROVIDER_LABEL[provider]}
      </span>
    </Chip>
  );
}
