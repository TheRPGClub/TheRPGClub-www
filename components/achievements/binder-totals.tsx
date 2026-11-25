import type {
  AchievementProvider,
  AchievementTotals,
  LinkedAccountSummary,
} from "@/lib/api/types";
import { totalStats } from "@/lib/member-achievements";
import { cn } from "@/lib/utils";
import { ProviderBadge } from "./provider-badge";

// The totals: Unlocks as the monumental numeral, then Completions,
// Masteries, Platinums and RA points (the last three only where a Linked
// Account or an earned one makes them mean something; see totalStats).
export function BinderTotals({
  totals,
  linked,
  className,
}: {
  totals: AchievementTotals;
  linked: AchievementProvider[];
  className?: string;
}) {
  const [lead, ...rest] = totalStats(totals, linked);
  const label = (s: typeof lead) => (s.value === 1 ? s.label[0] : s.label[1]);
  return (
    <dl className={cn("flex flex-col gap-5", className)}>
      <div className="flex items-end gap-3">
        <dd className="font-headline text-[4.5rem] leading-[0.8] text-foreground sm:text-[5.25rem]">
          {lead.value.toLocaleString("en-US")}
        </dd>
        <dt className="font-label max-w-[7ch] pb-0.5 text-[1rem] leading-[1.1] text-dim-foreground">
          {label(lead)}
        </dt>
      </div>
      {rest.length > 0 && (
        <div className="flex flex-wrap gap-x-6 gap-y-4">
          {rest.map((stat) => (
            <div key={stat.key} className="flex flex-col-reverse gap-1.5">
              <dt className="font-label text-[0.74rem] leading-[1.1] tracking-[0.08em] whitespace-nowrap text-faint-foreground">
                {label(stat)}
              </dt>
              <dd className="font-headline text-[2rem] leading-[0.8] text-foreground">
                {stat.value.toLocaleString("en-US")}
              </dd>
            </div>
          ))}
        </div>
      )}
    </dl>
  );
}

// Linked Accounts as solid Provider chips carrying the member's name there.
export function LinkedAccountChips({
  accounts,
  className,
}: {
  accounts: LinkedAccountSummary[];
  className?: string;
}) {
  if (accounts.length === 0) return null;
  return (
    <ul aria-label="Linked Accounts" className={cn("flex flex-wrap items-start gap-1.5", className)}>
      {accounts.map((account) => (
        <li key={account.provider} className="max-w-full">
          <ProviderBadge
            provider={account.provider}
            short
            name={account.display_name}
            className="max-w-full"
          />
        </li>
      ))}
    </ul>
  );
}
