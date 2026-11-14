import Link from "next/link";
import {
  FEED_VIEW_OPTIONS,
  feedHref,
  type AchievementFeedFilters as Filters,
} from "@/lib/api/achievement-feed";
import { ACHIEVEMENT_PROVIDERS, PROVIDER_LABEL } from "@/lib/achievements";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// The hub's two controls, both plain links so the URL holds the state
// (`?view=`, `?provider=`; either change returns to page 1). The views are
// Tabs whose tabs are those links; the current one carries a yellow inset
// ring, the selection mark.

export function HubViewTabs({ filters }: { filters: Filters }) {
  return (
    <Tabs value={filters.view} className="gap-0">
      <TabsList variant="chip" aria-label="Feed view">
        {FEED_VIEW_OPTIONS.map((option) => (
          <TabsTrigger
            key={option.value}
            value={option.value}
            nativeButton={false}
            render={<Link href={feedHref(filters, { view: option.value, page: 1 })} scroll={false} />}
            className="h-[34px] flex-none gap-2 border-0 px-3.5 py-0 text-base"
          >
            {option.value === "highlights" && (
              <span aria-hidden className="foil size-3 rounded-xs" />
            )}
            {option.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
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

// The Provider filter with the note that days are UTC.
export function HubFilterRow({ filters }: { filters: Filters }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <HubProviderFilter filters={filters} />
      <p className="font-label ml-auto text-[0.8rem] tracking-[0.08em] text-faint-foreground">
        Days in UTC
      </p>
    </div>
  );
}
