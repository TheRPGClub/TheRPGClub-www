import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  feedHref,
  hasFeedFilters,
  type AchievementFeedFilters as Filters,
} from "@/lib/api/achievement-feed";
import { PROVIDER_LABEL } from "@/lib/achievements";

// What the hub says when there is nothing to show: a page past the end, a
// Provider with nothing yet, or nobody linked at all.

export function FeedEmpty({ filters, editHref }: { filters: Filters; editHref: string }) {
  if (filters.page > 1) {
    return (
      <EmptyState>
        Nothing on this page.{" "}
        <Link href={feedHref(filters, { page: 1 })} className={INLINE_LINK}>
          Back to the first page
        </Link>
      </EmptyState>
    );
  }
  if (hasFeedFilters(filters)) {
    const provider = PROVIDER_LABEL[filters.provider!];
    return <EmptyState>No {provider} Unlocks yet.</EmptyState>;
  }
  // Nobody has linked anything: point the viewer at their own Linked
  // Accounts.
  return (
    <div className="flex flex-col items-center gap-4 rounded-md border border-dashed border-border-strong px-4 py-12 text-center">
      <p className="text-dim-foreground">
        No one has linked a RetroAchievements, Steam or PlayStation account yet.
      </p>
      <Link
        href={editHref}
        className="font-label group inline-flex items-center gap-1.5 text-sm font-extrabold text-foreground transition-colors hover:text-highlight [&_svg]:size-4 motion-safe:[&_svg]:transition-transform motion-safe:hover:[&_svg]:translate-x-0.5"
      >
        Link your accounts
        <ArrowRight aria-hidden />
      </Link>
    </div>
  );
}

const INLINE_LINK =
  "font-semibold text-foreground underline underline-offset-4 transition-colors hover:text-highlight";

export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-md border border-dashed border-border-strong px-4 py-12 text-center text-dim-foreground">
      {children}
    </p>
  );
}
