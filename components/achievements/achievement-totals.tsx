import type {
  AchievementProvider,
  AchievementTotals,
  LinkedAccountSummary,
} from "@/lib/api/types";
import { PROVIDER_LABEL } from "@/lib/achievements";
import { totalStats } from "@/lib/member-achievements";
import { cn } from "@/lib/utils";
import { ProviderBadge } from "./provider-badge";

// A member's achievement totals as monumental numerals over label captions:
// Unlocks and Completions always, Masteries and RA points with a
// RetroAchievements account, Platinums with a PSN one.
export function AchievementTotalsRow({
  totals,
  linked,
  className,
}: {
  totals: AchievementTotals;
  linked: AchievementProvider[];
  className?: string;
}) {
  const stats = totalStats(totals, linked);
  return (
    <dl
      className={cn(
        "flex flex-wrap gap-x-8 gap-y-4 sm:gap-x-10",
        className,
      )}
    >
      {stats.map((stat, i) => (
        <div key={stat.key} className="flex flex-col-reverse gap-1.5">
          <dt className="font-label text-[0.85rem] tracking-[0.08em] text-faint-foreground">
            {stat.value === 1 ? stat.label[0] : stat.label[1]}
          </dt>
          <dd
            className={cn(
              "font-headline leading-[0.8] text-foreground",
              i === 0 ? "text-[3.75rem] sm:text-[4.5rem]" : "text-[2.6rem] sm:text-[3rem]",
            )}
          >
            {stat.value.toLocaleString("en-US")}
          </dd>
        </div>
      ))}
    </dl>
  );
}

// The member's Linked Accounts: Provider chips with the account's name.
export function LinkedAccountBadges({
  accounts,
  className,
}: {
  accounts: LinkedAccountSummary[];
  className?: string;
}) {
  if (accounts.length === 0) return null;
  return (
    <ul aria-label="Linked Accounts" className={cn("flex flex-wrap gap-1.5", className)}>
      {accounts.map((account) => (
        <li key={account.provider} className="flex items-center gap-1.5">
          <ProviderBadge provider={account.provider} />
          {account.display_name && (
            <span
              className="font-label pr-2 text-[0.85rem] text-dim-foreground"
              title={`${PROVIDER_LABEL[account.provider]}: ${account.display_name}`}
            >
              {account.display_name}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
