import Link from "next/link";
import {
  FEED_VIEW_OPTIONS,
  feedHref,
  type AchievementFeedFilters as Filters,
} from "@/lib/api/achievement-feed";
import { ACHIEVEMENT_PROVIDERS, PROVIDER_LABEL } from "@/lib/achievements";
import { Badge } from "@/components/ui/badge";
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
export function HubProviderFilter({ filters }: { filters: Filters }) {
  const all = filters.provider == null;
  return (
    <nav aria-label="Provider">
      <ul className="flex flex-wrap gap-1.5">
        <li>
          <Badge
            render={<Link href={feedHref(filters, { provider: null, page: 1 })} scroll={false} />}
            aria-current={all ? "page" : undefined}
            tone="option"
            size="filter"
            className="border-0"
          >
            All
          </Badge>
        </li>
        {ACHIEVEMENT_PROVIDERS.map((provider) => {
          const on = filters.provider === provider;
          return (
            <li key={provider}>
              <Badge
                render={<Link href={feedHref(filters, { provider, page: 1 })} scroll={false} />}
                aria-current={on ? "page" : undefined}
                tone={`provider-${provider}`}
                fill={all || on ? "solid" : "outline"}
                size="filter"
                className="border-0"
              >
                {PROVIDER_LABEL[provider]}
              </Badge>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
