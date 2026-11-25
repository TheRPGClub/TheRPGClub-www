import Link from "next/link";
import { SidebarMenu, SidebarMenuButton } from "@/components/ui/sidebar";
import { useSortable } from "@/hooks/use-sortable";
import { NAV_BUTTON_CLASS, PAGE_ICON } from "@/components/shell/nav-items";
import {
  PageBadges,
  pageLabel,
  pageTooltip,
  type SidebarNavModel,
} from "@/components/shell/sidebar-page";
import { PinnedRowUnpin } from "@/components/shell/sidebar-pin";
import {
  ROW_MENU_KEYS,
  SidebarPageItem,
} from "@/components/shell/sidebar-page-item";
import { SortGrip } from "@/components/sortable/sort-grip";
import { SortStatus } from "@/components/sortable/sort-status";
import type { PinnedPageKey } from "@/lib/sidebar";

// The member's Pinned Pages, in their order. In the expanded sidebar a row
// itself drags into a new place (Make Room: mouse past 5px, touch press and
// hold, keyboard Space and the arrows) and a plain click or tap still
// follows its link; none of that on the icon rail (`railed`).
export function SidebarPinned({
  nav,
  railed,
}: {
  nav: SidebarNavModel;
  railed: boolean;
}) {
  const byKey = new Map<PinnedPageKey, (typeof nav.pinned)[number]>(nav.pinned.map((page) => [page.key, page]));
  const sort = useSortable<"pins", PinnedPageKey>({
    zones: { pins: nav.pinned.map((page) => page.key) },
    layout: "rows",
    onDrop: (next) => nav.pins.reorder(next.pins),
    disabled: railed,
    name: (key) => {
      const page = byKey.get(key);
      return page ? pageLabel(page, nav.votingPhase) : key;
    },
  });

  return (
    <>
      <SidebarMenu {...sort.zone("pins")} className="gap-0.5">
        {sort.zones.pins.map((key) => {
          const page = byKey.get(key);
          if (!page) return null;
          const Icon = PAGE_ICON[page.key];
          return (
            <SidebarPageItem
              key={page.key}
              page={page}
              nav={nav}
              pressable={!railed}
              sort={railed ? undefined : sort.item(page.key)}
            >
              {!railed && (
                <SortGrip className="absolute top-1/2 -left-2 size-3.5 -translate-y-1/2" />
              )}
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
      {!railed && <SortStatus status={sort.status} />}
    </>
  );
}
