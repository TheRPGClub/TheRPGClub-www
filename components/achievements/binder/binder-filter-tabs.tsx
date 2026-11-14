import Link from "next/link";
import type { AchievementProvider, AchievementSetsStatus } from "@/lib/api/types";
import { PROVIDER_LABEL, PROVIDER_SHORT_LABEL } from "@/lib/achievements";
import {
  SET_STATUS_LABEL,
  providerToggle,
  type BinderHref,
  type MemberAchievementsQuery,
} from "@/lib/member-achievements";
import type { StatusCounts } from "@/lib/member-achievements-binder";
import { cn } from "@/lib/utils";
import { PROVIDER_FILL } from "../provider-badge";

const tabBase =
  "font-label inline-flex h-8 items-center gap-1.5 rounded-t-[4px] px-3 text-[0.82rem] whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-highlight";

// The filter tabs on the binder's top edge: status, then one tab per Linked
// Account's Provider in its own colour. A Provider tab toggles. Sort lives
// in the index header.
export function BinderFilterTabs({
  query,
  linked,
  counts,
  href,
}: {
  query: MemberAchievementsQuery;
  linked: AchievementProvider[];
  counts: StatusCounts | null;
  href: BinderHref;
}) {
  const { filter } = query;
  // A Provider filter is only worth offering with two Linked Accounts, but
  // a filter already in the URL stays visible so it can be cleared.
  const providers = linked.length > 1 || filter.provider ? linked : [];
  const statuses: { key: "all" | AchievementSetsStatus; label: string; value: AchievementSetsStatus | null }[] = [
    { key: "all", label: "All", value: null },
    ...(Object.keys(SET_STATUS_LABEL) as AchievementSetsStatus[]).map((s) => ({
      key: s,
      label: SET_STATUS_LABEL[s],
      value: s,
    })),
  ];

  return (
    <div className="flex flex-wrap items-end gap-x-5 gap-y-1 pr-4 xl:pl-[calc(25rem+2.5rem)]">
      <nav aria-label="Status">
        <ul className="flex items-end gap-1">
          {statuses.map((s) => {
            const on = filter.status === s.value;
            const n = counts?.[s.key];
            return (
              <li key={s.key}>
                <Link
                  href={href({ filter: { status: s.value } })}
                  aria-current={on ? "true" : undefined}
                  scroll={false}
                  className={cn(
                    tabBase,
                    on
                      ? "h-9 bg-card text-foreground shadow-[inset_0_2px_0_var(--color-foreground)]"
                      : "bg-muted text-dim-foreground shadow-[inset_0_1px_0_var(--color-border-strong)] hover:text-highlight",
                  )}
                >
                  {s.label}
                  {n != null && <span className={on ? "text-foreground" : "text-faint-foreground"}>{n}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      {providers.length > 0 && (
        <nav aria-label="Provider">
          <ul className="flex items-end gap-1">
            {providers.map((p) => {
              const on = filter.provider === p;
              const dim = filter.provider != null && !on;
              return (
                <li key={p}>
                  <Link
                    href={href({ filter: { provider: providerToggle(filter.provider, p) } })}
                    aria-current={on ? "true" : undefined}
                    aria-label={`${PROVIDER_LABEL[p]}${on ? " (clear filter)" : ""}`}
                    scroll={false}
                    className={cn(
                      tabBase,
                      PROVIDER_FILL[p],
                      "text-background",
                      on && "h-9 shadow-[inset_0_2px_0_var(--color-foreground)]",
                      dim && "h-7 hover:h-8",
                      "motion-safe:transition-[height]",
                    )}
                  >
                    {PROVIDER_SHORT_LABEL[p]}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </div>
  );
}
