"use client";

import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import type { SessionMembership, SessionPrincipal } from "@/lib/auth-types";
import type { VotingPhase } from "@/lib/api/voting-round";
import type { SessionFeature } from "@/lib/features";
import { SidebarAccount } from "@/components/shell/sidebar-account";
import { SidebarBrand } from "@/components/shell/sidebar-brand";
import { SidebarNav } from "@/components/shell/sidebar-nav";
import { SidebarStaffNav } from "@/components/shell/sidebar-staff-nav";

interface AppSidebarProps {
  principal: SessionPrincipal;
  membership: SessionMembership | null;
  // null when no round is scheduled or the read failed — the item keeps its
  // plain name rather than the nav breaking.
  votingPhase?: VotingPhase | null;
  // The session's `features`: items for Features this viewer isn't shown are
  // left out, and staff see a Preview badge on Preview ones.
  features?: SessionFeature[];
}

// The signed-in site's sidebar: the club's mark, its sections, the staff
// tools this member's role can use, and the member's own corner.
export function AppSidebar({ principal, membership, votingPhase, features }: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon">
      <SidebarBrand />
      <SidebarContent>
        <SidebarNav votingPhase={votingPhase} features={features} />
        <SidebarStaffNav membership={membership} />
      </SidebarContent>
      <SidebarAccount principal={principal} />
    </Sidebar>
  );
}
