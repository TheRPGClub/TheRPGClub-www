import { useRef, useState } from "react";
import { SidebarMenuItem } from "@/components/ui/sidebar";
import type { SidebarPage } from "@/lib/sidebar";
import { useLongPress } from "@/hooks/use-long-press";
import type { useSortable } from "@/hooks/use-sortable";
import type { SidebarNavModel } from "@/components/shell/sidebar-page";
import { SidebarPageMenu } from "@/components/shell/sidebar-page-menu";

// The keys that open a row's menu from the keyboard, for `aria-keyshortcuts`
// on the row's link. The menu key (ContextMenu) does too.
export const ROW_MENU_KEYS = "Shift+F10";

// A sortable row's props (useSortable's `item(id)`).
export type SortItemProps = ReturnType<ReturnType<typeof useSortable>["item"]>;

const opensMenu = (e: React.KeyboardEvent) => e.key === "ContextMenu" || (e.shiftKey && e.key === "F10");

// A page's row in the sidebar (a group's entry or a Pinned row). With
// `pressable`, Shift+F10 / the menu key opens the row's menu, and so does a
// long press on a touchscreen; a tap still follows the link. Off on the icon
// rail and its panel, where there is no pinning. A Pinned row passes `sort`:
// the row itself drags (Make Room), so on touch a press and hold lifts it
// instead of opening the menu; touch unpins from the page's entry in its
// section, where the long press still opens the menu.
export function SidebarPageItem({
  page,
  nav,
  pressable,
  sort,
  children,
}: {
  page: SidebarPage;
  nav: SidebarNavModel;
  pressable: boolean;
  sort?: SortItemProps;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLLIElement>(null);
  const [open, setOpen] = useState(false);
  // The keyboard opened the menu: focus goes back to the row's link.
  const byKey = useRef(false);
  const press = useLongPress(pressable && !sort, () => {
    byKey.current = false;
    setOpen(true);
  });
  // The lifting finger isn't a tap outside the menu it just opened.
  const change = (next: boolean) => {
    if (!next && press.held()) return;
    setOpen(next);
  };
  const link = () => ref.current?.querySelector<HTMLElement>("[data-slot=sidebar-menu-button]") ?? null;

  const onKeyDown = (e: React.KeyboardEvent<HTMLLIElement>) => {
    sort?.onKeyDown(e);
    if (!pressable || !opensMenu(e) || !e.currentTarget.contains(e.target as Node)) return;
    e.preventDefault();
    byKey.current = true;
    setOpen(true);
  };

  return (
    // No text selection or link preview under a holding finger.
    <SidebarMenuItem
      {...press.handlers}
      {...sort}
      ref={(el: HTMLLIElement | null) => {
        ref.current = el;
        sort?.ref(el);
      }}
      onKeyDown={onKeyDown}
      // The menu key's own context menu, after it opened this one.
      onContextMenu={(e) => {
        if (byKey.current && open) e.preventDefault();
        else if ("onContextMenu" in press.handlers) press.handlers.onContextMenu(e);
      }}
      className="[-webkit-touch-callout:none] [@media(hover:none)]:select-none"
    >
      {children}
      {pressable && (
        <SidebarPageMenu
          page={page}
          nav={nav}
          anchor={ref}
          open={open}
          onOpenChange={change}
          finalFocus={() => (byKey.current ? (link() ?? true) : true)}
        />
      )}
    </SidebarMenuItem>
  );
}
