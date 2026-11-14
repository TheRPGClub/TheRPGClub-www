import Link from "next/link";
import type { AchievementProvider } from "@/lib/api/types";
import {
  FEED_VIEW_OPTIONS,
  feedHref,
  type AchievementFeedFilters as Filters,
} from "@/lib/api/achievement-feed";
import { ACHIEVEMENT_PROVIDERS, PROVIDER_LABEL } from "@/lib/achievements";
import { cn } from "@/lib/utils";

// The hub's two controls, both plain links so the URL holds the state
// (`?view=`, `?provider=`; either change returns to page 1). The current
// option carries a yellow inset ring, the selection mark.

const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight";

export function HubViewTabs({ filters }: { filters: Filters }) {
  return (
    <nav aria-label="Feed view">
      <ul className="flex gap-1.5">
        {FEED_VIEW_OPTIONS.map((option) => {
          const on = option.value === filters.view;
          return (
            <li key={option.value}>
              <Link
                href={feedHref(filters, { view: option.value, page: 1 })}
                aria-current={on ? "page" : undefined}
                scroll={false}
                className={cn(
                  "font-label inline-flex h-[34px] items-center gap-2 rounded-sm px-3.5 text-base font-extrabold tracking-[0.06em] transition-colors",
                  on
                    ? "text-foreground shadow-[inset_0_0_0_1.5px_var(--color-highlight)]"
                    : "bg-foreground/6 text-dim-foreground hover:bg-foreground/10 hover:text-foreground",
                  FOCUS,
                )}
              >
                {option.value === "highlights" && (
                  <span aria-hidden className="foil size-3 rounded-xs" />
                )}
                {option.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// "All" plus one chip per Provider in its own colour. With every Provider
// shown, every chip is solid; once one is picked, it alone stays solid and
// the rest drop to an outline in their colour.
const PROVIDER_CHIP: Record<AchievementProvider, { solid: string; outline: string }> = {
  retroachievements: {
    solid: "bg-provider-retroachievements text-provider-foreground",
    outline:
      "text-provider-retroachievements shadow-[inset_0_0_0_1.5px_var(--color-provider-retroachievements)]",
  },
  steam: {
    solid: "bg-provider-steam text-provider-foreground",
    outline: "text-provider-steam shadow-[inset_0_0_0_1.5px_var(--color-provider-steam)]",
  },
  psn: {
    solid: "bg-provider-psn text-provider-foreground",
    outline: "text-provider-psn shadow-[inset_0_0_0_1.5px_var(--color-provider-psn)]",
  },
};

const CHIP =
  "font-label inline-flex h-[26px] items-center rounded-xs px-2.5 text-[0.8rem] font-extrabold tracking-[0.06em] whitespace-nowrap transition-[color,background-color,box-shadow,opacity]";

export function HubProviderFilter({ filters }: { filters: Filters }) {
  const all = filters.provider == null;
  return (
    <nav aria-label="Provider">
      <ul className="flex flex-wrap gap-1.5">
        <li>
          <Link
            href={feedHref(filters, { provider: null, page: 1 })}
            aria-current={all ? "page" : undefined}
            scroll={false}
            className={cn(
              CHIP,
              all
                ? "text-foreground shadow-[inset_0_0_0_1.5px_var(--color-highlight)]"
                : "bg-foreground/6 text-dim-foreground hover:text-foreground",
              FOCUS,
            )}
          >
            All
          </Link>
        </li>
        {ACHIEVEMENT_PROVIDERS.map((provider) => {
          const on = filters.provider === provider;
          const style = PROVIDER_CHIP[provider];
          return (
            <li key={provider}>
              <Link
                href={feedHref(filters, { provider, page: 1 })}
                aria-current={on ? "page" : undefined}
                scroll={false}
                className={cn(
                  CHIP,
                  all || on ? style.solid : cn(style.outline, "hover:brightness-125"),
                  on && "outline-2 outline-offset-2 outline-highlight",
                  !on && FOCUS,
                )}
              >
                {PROVIDER_LABEL[provider]}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
