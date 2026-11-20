"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { LayoutDashboard } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import type { SessionMembership } from "@/lib/auth-types";
import type { VotingPhase } from "@/lib/api/voting-round";
import { featureView, type SessionFeature } from "@/lib/features";
import { currentPage, sidebarGroups } from "@/lib/sidebar";
import { DASHBOARD_HREF, TAB_CLASS, isCurrent } from "@/components/shell/nav-items";
import { TabGroupMenu } from "@/components/shell/tab-group-menu";
import { TabRound } from "@/components/shell/tab-round";

// The phone's navigation, in place of the sidebar: a tab bar along the foot
// of the screen with Home, the Browse groups (Play, Games, Club) and the
// round button between them. A group's tab pops up its pages; Staff lives
// in the top bar's account menu. The tab holding the current page carries
// the red you-are-here bar.
export function TabBar({
  membership,
  votingPhase,
  features,
}: {
  membership: SessionMembership | null;
  votingPhase: VotingPhase | null;
  features: SessionFeature[] | undefined;
}) {
  const pathname = usePathname();
  const groups = useMemo(
    () => sidebarGroups(features, membership).filter((g) => g.key !== "staff"),
    [features, membership],
  );
  const current = currentPage(groups, pathname);
  const home = isCurrent(pathname, DASHBOARD_HREF);
  const tabs = groups.map((group) => (
    <li key={group.key}>
      <TabGroupMenu group={group} current={current} votingPhase={votingPhase} />
    </li>
  ));
  // The round sits second from the left of centre, after Home and the first
  // group; Voting & GOTM hidden from this viewer, there is no round.
  if (featureView(features).shown("voting_gotm")) {
    tabs.splice(1, 0, (
      <li key="round" className="grid place-items-center">
        <TabRound phase={votingPhase} />
      </li>
    ));
  }

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-sidebar-border bg-sidebar pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="grid h-15.5 auto-cols-fr grid-flow-col">
        <li>
          <ButtonLink
            href={DASHBOARD_HREF}
            variant="tab"
            size="bare"
            aria-current={home ? "page" : undefined}
            data-current={home || undefined}
            className={TAB_CLASS}
          >
            <LayoutDashboard aria-hidden />
            Home
          </ButtonLink>
        </li>
        {tabs}
      </ul>
    </nav>
  );
}
