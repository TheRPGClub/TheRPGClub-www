import Link from "next/link";
import type { CollectionPlatformSummary } from "@/lib/api/types";

// The `platform_id` filter value: a gamedb platform id, or "none" for entries
// with no platform. null means unfiltered.
export type PlatformFilter = string | null;

// Only a numeric id or "none" reaches the API; anything else reads as "All"
// rather than being passed through into the query string.
export function parsePlatformFilter(raw: string | undefined): PlatformFilter {
  if (raw === "none") return "none";
  if (raw && /^\d+$/.test(raw)) return raw;
  return null;
}

// The collected-games URL for a page and filter. Page 1 and "All" stay off the
// query string so the canonical URL is the bare path.
export function collectedGamesHref(
  userId: string,
  { page = 1, platformId = null }: { page?: number; platformId?: PlatformFilter },
): string {
  const ps = new URLSearchParams();
  if (platformId) ps.set("platform_id", platformId);
  if (page > 1) ps.set("page", String(page));
  return `/members/${userId}/collected-games${ps.size ? `?${ps}` : ""}`;
}

export interface CollectionPlatformStripProps {
  userId: string;
  summary: CollectionPlatformSummary;
  current: PlatformFilter;
}

// Total plus one chip per platform, each linking to the list filtered to it.
// Same chip treatment as the games index winner filter.
export function CollectionPlatformStrip({
  userId,
  summary,
  current,
}: CollectionPlatformStripProps) {
  const chips = [
    { key: "all", value: null, label: "All", count: summary.total_count },
    ...(summary.platform_counts ?? []).map((row) => ({
      key: String(row.platform_id ?? "none"),
      value: row.platform_id === null ? "none" : String(row.platform_id),
      label:
        row.platform_id === null
          ? "No platform"
          : (row.platform_abbreviation ?? row.platform_name ?? "Unknown"),
      title: row.platform_name ?? undefined,
      count: row.count,
    })),
  ];

  return (
    <nav aria-label="Filter by platform">
      <ul className="flex flex-wrap gap-2">
        {chips.map((chip) => {
          const isActive = chip.value === current;
          return (
            <li key={chip.key}>
              <Link
                href={collectedGamesHref(userId, { platformId: chip.value })}
                aria-current={isActive ? "page" : undefined}
                title={"title" in chip ? chip.title : undefined}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wider ring-1 ring-inset transition-colors ${
                  isActive
                    ? "bg-foreground/10 text-foreground ring-foreground/30"
                    : "bg-muted/40 text-muted-foreground ring-border hover:bg-muted hover:text-foreground"
                }`}
              >
                {chip.label}
                <span className="tabular-nums opacity-70">{chip.count}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
