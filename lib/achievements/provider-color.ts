import type { AchievementProvider } from "@/lib/api/types";

// Each Provider's colour token, for a mark drawn inline (a small square).
export const PROVIDER_VAR: Record<AchievementProvider, string> = {
  retroachievements: "var(--color-provider-retroachievements)",
  steam: "var(--color-provider-steam)",
  psn: "var(--color-provider-psn)",
};
