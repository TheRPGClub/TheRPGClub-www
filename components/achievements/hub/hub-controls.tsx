import Link from "next/link";
import {
  feedHref,
  type AchievementFeedFilters as Filters,
} from "@/lib/api/achievement-feed";
import { ACHIEVEMENT_PROVIDERS, PROVIDER_LABEL } from "@/lib/achievements";
import { Badge } from "@/components/ui/badge";

// The hub's Provider filter, plain links so the URL holds the state
// (`?provider=`; a change returns to page 1).

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
                unpicked={!all && !on}
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
