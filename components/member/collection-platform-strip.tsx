import Link from "next/link";
import type { CollectionPlatformSummary } from "@/lib/api/types";
import { cn } from "@/lib/utils";

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
// The member pages' tab treatment: the active platform is set in paper.
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
    <nav
      aria-label="Filter by platform"
      className="border-y border-rule py-2.5"
    >
      <ul className="flex flex-wrap gap-1">
        {chips.map((chip) => {
          const isActive = chip.value === current;
          return (
            <li key={chip.key}>
              <Link
                href={collectedGamesHref(userId, { platformId: chip.value })}
                aria-current={isActive ? "page" : undefined}
                title={"title" in chip ? chip.title : undefined}
                className={cn(
                  "font-label inline-flex h-8 items-center gap-2 rounded-[3px] px-2.5 text-[0.88rem] font-extrabold tracking-[0.06em] transition-colors",
                  isActive
                    ? "bg-paper text-ink"
                    : "text-paper-dim hover:bg-ink-3 hover:text-paper",
                )}
              >
                {chip.label}
                <span className="font-headline text-[1.05rem] font-normal tracking-normal">
                  {chip.count}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
