"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { LayoutDashboard } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import type { SessionMembership } from "@/lib/auth-types";
import type { VotingPhase } from "@/lib/api/voting-round";
import type { SessionFeature } from "@/lib/features";
import { NO_PATCH_SEEN, type PatchSeen } from "@/lib/patch-notes/patch-mark";
import { currentPage, sidebarGroups } from "@/lib/sidebar";
import { usePatchUnseen } from "@/hooks/use-patch-unseen";
import { DASHBOARD_HREF, TAB_CLASS, isCurrent } from "@/components/shell/nav-items";
import { TabGroupMenu } from "@/components/shell/tab-group-menu";

// The phone's navigation, in place of the sidebar: a tab bar along the foot
// of the screen with Home, the Browse groups (Play, Games, Club), and last
// the member's own "You" tab (their avatar), which opens the account menu (www#164; there is no top bar). A
// group's tab pops up its pages; Staff lives in the account menu. The tab
// holding the current page carries the red you-are-here bar.
export function TabBar({
  membership,
  votingPhase,
  features,
  patchSeen = NO_PATCH_SEEN,
  account,
}: {
  membership: SessionMembership | null;
  votingPhase: VotingPhase | null;
  features: SessionFeature[] | undefined;
  // The session's Patch Mark: NEW on the Club tab and Patch Notes.
  patchSeen?: PatchSeen;
  // The account menu, as the last tab.
  account: React.ReactNode;
}) {
  const pathname = usePathname();
  const groups = useMemo(
    () => sidebarGroups(features, membership).filter((g) => g.key !== "staff"),
    [features, membership],
  );
  const current = currentPage(groups, pathname);
  const home = isCurrent(pathname, DASHBOARD_HREF);
  const patchUnseen = usePatchUnseen(patchSeen);
  const tabs = groups.map((group) => (
    <li key={group.key}>
      <TabGroupMenu group={group} current={current} votingPhase={votingPhase} patchUnseen={patchUnseen} />
    </li>
  ));

  return (
    <nav
      aria-label="Main"
      data-slot="tab-bar"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-sidebar-border bg-sidebar pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] md:hidden"
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
        <li>{account}</li>
      </ul>
    </nav>
  );
}
