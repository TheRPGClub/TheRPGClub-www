import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import type { SidebarGroupKey } from "@/lib/sidebar";
import {
  DASHBOARD_HREF,
  NAV_BUTTON_CLASS,
  PAGE_ICON,
  isCurrent,
} from "@/components/shell/nav-items";
import { SidebarGroupRow } from "@/components/shell/sidebar-group-row";
import {
  PageBadges,
  pageLabel,
  pageTooltip,
  type SidebarNavModel,
} from "@/components/shell/sidebar-page";
import { PinnedRowUnpin } from "@/components/shell/sidebar-pin";
import { SidebarPageItem } from "@/components/shell/sidebar-page-item";

// The two headings sit 38px tall with their caps on the baseline, so the
// rows under them start on the same 40px rhythm.
const HEADING_CLASS = "h-[38px] items-end px-2.5 pb-1.5 text-[0.78rem]";

// The sidebar's main view: Dashboard, the member's Pinned Pages, then the
// Browse groups.
export function SidebarMain({
  nav,
  openGroup,
  onOpenGroup,
}: {
  nav: SidebarNavModel;
  openGroup: SidebarGroupKey | null;
  onOpenGroup: (key: SidebarGroupKey) => void;
}) {
  const pathname = usePathname();
  const { state, isMobile } = useSidebar();
  // No pinning on the icon rail.
  const railed = state === "collapsed" && !isMobile;

  return (
    <SidebarGroup className="pt-3">
      <SidebarMenu className="gap-0.5">
        <SidebarMenuItem>
          <SidebarMenuButton
            render={<Link href={DASHBOARD_HREF} />}
            isActive={isCurrent(pathname, DASHBOARD_HREF)}
            tooltip="Dashboard"
            className={NAV_BUTTON_CLASS}
          >
            <LayoutDashboard />
            <span>Dashboard</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>

      <SidebarGroupLabel className={HEADING_CLASS}>Pinned</SidebarGroupLabel>
      <SidebarMenu className="gap-0.5">
        {nav.pinned.map((page) => {
          const Icon = PAGE_ICON[page.key];
          return (
            <SidebarPageItem key={page.key} page={page} nav={nav} pressable={!railed}>
              <SidebarMenuButton
                render={<Link href={page.href} />}
                isActive={nav.current?.key === page.key}
                tooltip={pageTooltip(page, nav)}
                className={NAV_BUTTON_CLASS}
              >
                <Icon />
                <span>{pageLabel(page, nav.votingPhase)}</span>
                <PageBadges page={page} nav={nav} />
              </SidebarMenuButton>
              <PinnedRowUnpin page={page} nav={nav} />
            </SidebarPageItem>
          );
        })}
      </SidebarMenu>
      {nav.pinned.length === 0 && (
        // One fixed line, kept (but invisible) on the rail so nothing below moves.
        <p className="flex h-8 items-center overflow-hidden px-2.5 text-[0.8125rem] whitespace-nowrap text-faint-foreground group-data-[collapsible=icon]:invisible">
          Pin pages from any group.
        </p>
      )}

      <SidebarGroupLabel className={HEADING_CLASS}>Browse</SidebarGroupLabel>
      <SidebarMenu className="gap-0.5">
        {nav.groups.map((group) => (
          <SidebarGroupRow
            key={group.key}
            group={group}
            nav={nav}
            expanded={openGroup === group.key}
            onOpen={() => onOpenGroup(group.key)}
          />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
