import Link from "next/link";
import { SidebarMenu, SidebarMenuButton } from "@/components/ui/sidebar";
import { usePinDrag } from "@/hooks/use-pin-drag";
import { NAV_BUTTON_CLASS, PAGE_ICON } from "@/components/shell/nav-items";
import {
  PageBadges,
  pageLabel,
  pageTooltip,
  type SidebarNavModel,
} from "@/components/shell/sidebar-page";
import { PinnedRowUnpin } from "@/components/shell/sidebar-pin";
import { ROW_MENU_KEYS, SidebarPageItem } from "@/components/shell/sidebar-page-item";

// The member's Pinned Pages, in their order. In the expanded sidebar a row
// can be dragged into a new place with a mouse, and its menu (long press,
// or Shift+F10 / the menu key) moves it up or down; none of that on the
// icon rail (`railed`).
export function SidebarPinned({ nav, railed }: { nav: SidebarNavModel; railed: boolean }) {
  const dragRow = usePinDrag(nav.pins.keys, nav.pins.place);

  return (
    <SidebarMenu className="gap-0.5">
      {nav.pinned.map((page) => {
        const Icon = PAGE_ICON[page.key];
        return (
          <SidebarPageItem
            key={page.key}
            page={page}
            nav={nav}
            pressable={!railed}
            drag={railed ? undefined : dragRow(page.key)}
          >
            <SidebarMenuButton
              render={<Link href={page.href} />}
              isActive={nav.current?.key === page.key}
              tooltip={pageTooltip(page, nav)}
              aria-keyshortcuts={railed ? undefined : ROW_MENU_KEYS}
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
  );
}
