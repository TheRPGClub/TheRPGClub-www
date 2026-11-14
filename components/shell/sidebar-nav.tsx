"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { VotingPhase } from "@/lib/api/voting-round";
import { featureView, type SessionFeature } from "@/lib/features";
import { NAV_BADGE_CLASS } from "@/components/feature/preview-badge";
import {
  NAV_BUTTON_CLASS,
  NAV_MAIN,
  PHASE_LABEL,
  VOTING_HREF,
  isCurrent,
} from "@/components/shell/nav-items";

// The club's sections. Items for Features this viewer isn't shown are left
// out, and staff see a Preview badge on Preview ones.
export function SidebarNav({
  votingPhase,
  features,
}: {
  votingPhase?: VotingPhase | null;
  features?: SessionFeature[];
}) {
  const pathname = usePathname();
  const view = featureView(features);
  const items = NAV_MAIN.filter((item) => !item.feature || view.shown(item.feature));
  // Nominations or the vote are live: the club has open business, flagged
  // in the call-to-action yellow on the nav item itself.
  const votingOpen = votingPhase === "nominating" || votingPhase === "voting";

  return (
    <SidebarGroup className="pt-3">
      <SidebarGroupContent>
        <SidebarMenu className="gap-0.5">
          {items.map(({ href, icon: Icon, label: navLabel, feature }) => {
            const label =
              href === VOTING_HREF && votingPhase ? PHASE_LABEL[votingPhase] : navLabel;
            const preview = feature ? view.preview(feature) : false;
            const open = href === VOTING_HREF && votingOpen;

            return (
              <SidebarMenuItem key={href}>
                <SidebarMenuButton
                  render={<Link href={href} />}
                  isActive={isCurrent(pathname, href)}
                  // Collapsed to the icon rail the label is the tooltip,
                  // so the phase reaches the reader there too.
                  tooltip={preview ? `${label} (Preview)` : label}
                  className={NAV_BUTTON_CLASS}
                >
                  <Icon />
                  <span>{label}</span>
                  {(preview || open) && (
                    <span className="ml-auto flex gap-1">
                      {preview && <span className={NAV_BADGE_CLASS}>Preview</span>}
                      {open && <span className={NAV_BADGE_CLASS}>Open</span>}
                    </span>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
