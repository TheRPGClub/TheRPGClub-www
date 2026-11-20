"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/ui/sidebar";
import type { SessionMembership, SessionPrincipal } from "@/lib/auth-types";
import type { VotingPhase } from "@/lib/api/voting-round";
import { featureView, type SessionFeature } from "@/lib/features";
import { currentPage, pinnedPages, sidebarGroups } from "@/lib/sidebar";
import { memberPins, type PinRules } from "@/lib/pinned-pages";
import { usePinnedPages } from "@/hooks/use-pinned-pages";
import { SidebarAccount } from "@/components/shell/sidebar-account";
import { SidebarBrand } from "@/components/shell/sidebar-brand";
import { SidebarBrowse } from "@/components/shell/sidebar-browse";
import type { SidebarNavModel } from "@/components/shell/sidebar-page";

interface AppSidebarProps {
  principal: SessionPrincipal;
  membership: SessionMembership | null;
  // null when no round is scheduled or the read failed: the item keeps its
  // plain name rather than the nav breaking.
  votingPhase?: VotingPhase | null;
  // The session's `features`: pages for Features this viewer isn't shown are
  // left out, and staff see a Preview badge on Preview ones.
  features?: SessionFeature[];
  // The session's Pinned Pages; undefined (an API without them) reads as the
  // club default.
  pinnedPages?: string[];
  // The session's Pinned Pages limit, room and club default.
  pinRules: PinRules;
}

// The signed-in site's sidebar: the club's mark, Dashboard, the member's
// Pinned Pages and the Browse groups (Play, Games, Club, and Staff for the
// tools this member's role can use), and the member's own corner.
export function AppSidebar({ principal, membership, votingPhase, features, pinnedPages: sessionPins, pinRules }: AppSidebarProps) {
  const pathname = usePathname();
  const groups = useMemo(() => sidebarGroups(features, membership), [features, membership]);
  const pins = usePinnedPages(memberPins(sessionPins, pinRules), pinRules);
  const nav: SidebarNavModel = {
    groups,
    pinned: pinnedPages(groups, pins.keys),
    pins,
    current: currentPage(groups, pathname),
    votingPhase: votingPhase ?? null,
    view: featureView(features),
  };

  return (
    // z-30: the rail's slide-out panel and its scrim cover the top bar (z-20).
    // The fixed panel moves in past a landscape phone's notch, as the body's
    // padding moves the page.
    <Sidebar collapsible="icon" className="z-30 data-[side=left]:left-[env(safe-area-inset-left)]">
      <SidebarBrand />
      <SidebarBrowse nav={nav} />
      <SidebarAccount principal={principal} />
    </Sidebar>
  );
}
